import { PartialType } from '@nestjs/mapped-types';
import { CreateProductoInsumoDto } from './create-productos-insumo.dto';

export class UpdateProductoInsumoDto extends PartialType(CreateProductoInsumoDto) {}