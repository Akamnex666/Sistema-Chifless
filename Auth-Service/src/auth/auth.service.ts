import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { RefreshToken } from '../tokens/refresh-token.entity';
import { RevokedToken } from '../tokens/revoked-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService, TokenPair, JwtPayload } from './jwt.service';

export interface LoginResponse {
  user: Omit<User, 'password'>;
  tokens: TokenPair;
}

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(RevokedToken)
    private readonly revokedTokenRepository: Repository<RevokedToken>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registra un nuevo usuario con password hasheado
   */
  async register(registerDto: RegisterDto): Promise<Omit<User, 'password'>> {
    const { email, password, nombre } = registerDto;

    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    try {
      // Hash del password con bcrypt
      const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

      // Crear usuario
      const user = this.userRepository.create({
        email: email.toLowerCase(),
        password: hashedPassword,
        nombre,
      });

      const savedUser = await this.userRepository.save(user);

      // Retornar sin el password
      const { password: _, ...userWithoutPassword } = savedUser;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear el usuario');
    }
  }

  /**
   * Busca un usuario por email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  /**
   * Valida las credenciales del usuario
   */
  async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);

    if (!user || !user.activo) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Login: valida credenciales y genera tokens
   */
  async login(loginDto: LoginDto, deviceInfo?: string): Promise<LoginResponse> {
    const { email, password } = loginDto;

    const user = await this.validateCredentials(email, password);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar par de tokens
    const tokens = this.jwtService.generateTokenPair(user.id, user.email);

    // Guardar refresh token en BD
    const refreshToken = this.refreshTokenRepository.create({
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: this.jwtService.getRefreshTokenExpiration(),
      deviceInfo,
    });

    await this.refreshTokenRepository.save(refreshToken);

    // Retornar usuario sin password + tokens
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  /**
   * Busca un usuario por ID
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  /**
   * Refresh: genera nuevo access token usando refresh token válido
   */
  async refresh(refreshTokenStr: string): Promise<{ accessToken: string; expiresIn: number }> {
    // Verificar y decodificar el refresh token
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verifyToken(refreshTokenStr);
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    // Verificar que sea un refresh token
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Token proporcionado no es un refresh token');
    }

    // Verificar que el token no esté revocado
    if (payload.jti) {
      const isRevoked = await this.revokedTokenRepository.findOne({
        where: { jti: payload.jti },
      });
      if (isRevoked) {
        throw new UnauthorizedException('El refresh token ha sido revocado');
      }
    }

    // Verificar que el refresh token exista en BD y no esté revocado
    const storedToken = await this.refreshTokenRepository.findOne({
      where: {
        token: refreshTokenStr,
        revoked: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token no encontrado o expirado');
    }

    // Verificar que el usuario exista y esté activo
    const user = await this.findById(payload.sub);
    if (!user || !user.activo) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    // Generar nuevo access token
    const accessToken = this.jwtService.generateAccessToken(user.id, user.email);

    return {
      accessToken,
      expiresIn: 900000, // 15 minutos en ms
    };
  }

  /**
   * Logout: revoca el refresh token actual
   */
  async logout(refreshTokenStr: string, accessTokenJti?: string): Promise<void> {
    // Decodificar el refresh token para obtener info
    const payload = this.jwtService.decodeToken(refreshTokenStr);

    if (payload?.jti) {
      // Agregar a la blacklist
      const revokedToken = this.revokedTokenRepository.create({
        jti: payload.jti,
        userId: payload.sub,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        reason: 'logout',
      });
      await this.revokedTokenRepository.save(revokedToken);
    }

    // Marcar el refresh token como revocado en BD
    await this.refreshTokenRepository.update(
      { token: refreshTokenStr },
      { revoked: true },
    );
  }

  /**
   * Revoca todos los refresh tokens de un usuario (logout de todas las sesiones)
   */
  async logoutAll(userId: string): Promise<{ revokedCount: number }> {
    const result = await this.refreshTokenRepository.update(
      { userId, revoked: false },
      { revoked: true },
    );

    return { revokedCount: result.affected || 0 };
  }

  /**
   * Verifica si un token JTI está en la blacklist
   */
  async isTokenRevoked(jti: string): Promise<boolean> {
    const revoked = await this.revokedTokenRepository.findOne({
      where: { jti },
    });
    return !!revoked;
  }
}
