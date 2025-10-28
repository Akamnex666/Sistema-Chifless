import { PartialType } from '@nestjs/mapped-types';
import { CreateDetalleOrdenProduccionDto } from './create-detalles-orden-produccion.dto';

export class UpdateDetalleOrdenProduccionDto extends PartialType(CreateDetalleOrdenProduccionDto) {}