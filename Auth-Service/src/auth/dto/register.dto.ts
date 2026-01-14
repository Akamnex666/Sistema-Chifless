import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'usuario@chifles.com',
    description: 'Email único del usuario',
  })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  email: string;

  @ApiProperty({
    example: 'MiPassword123!',
    description: 'Contraseña (mínimo 8 caracteres, debe incluir mayúscula, minúscula y número)',
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50, { message: 'La contraseña no puede exceder 50 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
  })
  password: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre del usuario (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;
}
