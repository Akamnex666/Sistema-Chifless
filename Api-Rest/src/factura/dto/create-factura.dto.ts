import { IsNotEmpty, IsNumber, IsPositive, IsString, IsOptional } from 'class-validator';

export class CreateFacturaDto {
  @IsNotEmpty()
  @IsString()
  fecha_emision: string;

  @IsNumber()
  @IsPositive()
  total: number;

  @IsOptional()
  @IsString()
  estado_pago?: string;

  @IsNumber()
  @IsPositive()
  clienteId: number;

  @IsNumber()
  @IsPositive()
  pedidoId: number;
}