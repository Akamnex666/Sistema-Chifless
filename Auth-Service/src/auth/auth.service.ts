import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
}
