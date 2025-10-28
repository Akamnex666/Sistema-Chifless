import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePedidoDto {
  @IsNotEmpty()
  @IsString()
  fecha: string;

  @IsNotEmpty()
  @IsNumber()
  total: number;

  @IsNotEmpty()
  @IsString()
  estado: string;

  @IsNotEmpty()
  @IsNumber()
  clienteId: number;

  @IsNotEmpty()
  @IsNumber()
  facturaId: number;
}
