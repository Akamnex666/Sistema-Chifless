import { IsNumber, IsPositive } from 'class-validator';

export class CreateDetalleOrdenProduccionDto {
  @IsNumber()
  @IsPositive()
  ordenProduccionId: number;

  @IsNumber()
  @IsPositive()
  insumoId: number;

  @IsNumber()
  @IsPositive()
  cantidad_utilizada: number;
}
