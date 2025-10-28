import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateProductoInsumoDto {
  @IsNumber()
  @IsPositive()
  productoId: number;

  @IsNumber()
  @IsPositive()
  insumoId: number;

  @IsNumber()
  @IsPositive()
  cantidad_necesaria: number;
}