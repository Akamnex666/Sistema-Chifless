import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateClienteDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  apellido: string;

  @IsEmail()
  correo: string;

  @IsNotEmpty()
  @IsString()
  telefono: string;
}
