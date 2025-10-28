import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateDetallePedidoDto {
  @IsNumber()
  @IsPositive()
  cantidad_solicitada: number;

  @IsNumber()
  @IsPositive()
  precio_unitario: number;

  @IsNumber()
  @IsPositive()
  subtotal: number;

  @IsNumber()
  @IsPositive()
  productoId: number;

  @IsNumber()
  @IsPositive()
  pedidoId: number;
}