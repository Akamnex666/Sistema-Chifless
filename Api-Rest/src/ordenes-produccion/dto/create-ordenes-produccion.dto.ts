import { IsNotEmpty, IsString, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class CreateOrdenProduccionDto {
  @IsNotEmpty()
  @IsString()
  fecha_inicio: string;

  @IsNotEmpty()
  @IsString()
  fecha_fin: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsNumber()
  @IsPositive()
  productoId: number;

  @IsNumber()
  @IsPositive()
  cantidad_producir: number;
}