import { Controller, Get, Post, Body, Param, Delete, Put, ParseIntPipe } from '@nestjs/common';
import { ProductosInsumosService } from './productos-insumos.service';
import { CreateProductoInsumoDto } from './dto/create-productos-insumo.dto';
import { UpdateProductoInsumoDto } from './dto/update-productos-insumo.dto';
import { ProductoInsumo } from './entities/productos-insumo.entity';

@Controller('productos-insumos')
export class ProductosInsumosController {
  constructor(private readonly productosInsumosService: ProductosInsumosService) {}

  @Get()
  findAll(): Promise<ProductoInsumo[]> {
    return this.productosInsumosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ProductoInsumo> {
    return this.productosInsumosService.findOne(id);
  }

  @Get('producto/:productoId')
  findByProducto(@Param('productoId', ParseIntPipe) productoId: number): Promise<ProductoInsumo[]> {
    return this.productosInsumosService.findByProducto(productoId);
  }

  @Get('insumo/:insumoId')
  findByInsumo(@Param('insumoId', ParseIntPipe) insumoId: number): Promise<ProductoInsumo[]> {
    return this.productosInsumosService.findByInsumo(insumoId);
  }

  @Post()
  create(@Body() createProductoInsumoDto: CreateProductoInsumoDto): Promise<ProductoInsumo> {
    return this.productosInsumosService.create(createProductoInsumoDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductoInsumoDto: UpdateProductoInsumoDto,
  ): Promise<ProductoInsumo> {
    return this.productosInsumosService.update(id, updateProductoInsumoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.productosInsumosService.remove(id);
  }
}