import { PartialType } from '@nestjs/mapped-types';
import { CreateDetallePedidoDto } from './create-detalles-pedido.dto';

export class UpdateDetallePedidoDto extends PartialType(CreateDetallePedidoDto) {}