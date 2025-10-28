import { IsNotEmpty, IsString, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class CreateInsumoDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  unidad_medida: string;

  @IsNumber()
  @IsPositive()
  stock: number;

  @IsOptional()
  @IsString()
  estado?: string;
}