import { Controller, Get, Post, Body, Param, Delete, Put, ParseIntPipe } from '@nestjs/common';
import { DetallesOrdenProduccionService } from './detalles-orden-produccion.service';
import { CreateDetalleOrdenProduccionDto } from './dto/create-detalles-orden-produccion.dto';
import { UpdateDetalleOrdenProduccionDto } from './dto/update-detalles-orden-produccion.dto';
import { DetalleOrdenProduccion } from './entities/detalles-orden-produccion.entity';

@Controller('detalles-orden-produccion')
export class DetallesOrdenProduccionController {
  constructor(private readonly detallesOrdenProduccionService: DetallesOrdenProduccionService) {}

  @Get()
  findAll(): Promise<DetalleOrdenProduccion[]> {
    return this.detallesOrdenProduccionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<DetalleOrdenProduccion> {
    return this.detallesOrdenProduccionService.findOne(id);
  }

  @Get('orden/:ordenProduccionId')
  findByOrdenProduccion(@Param('ordenProduccionId', ParseIntPipe) ordenProduccionId: number): Promise<DetalleOrdenProduccion[]> {
    return this.detallesOrdenProduccionService.findByOrdenProduccion(ordenProduccionId);
  }

  @Post()
  create(@Body() createDetalleOrdenProduccionDto: CreateDetalleOrdenProduccionDto): Promise<DetalleOrdenProduccion> {
    return this.detallesOrdenProduccionService.create(createDetalleOrdenProduccionDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDetalleOrdenProduccionDto: UpdateDetalleOrdenProduccionDto,
  ): Promise<DetalleOrdenProduccion> {
    return this.detallesOrdenProduccionService.update(id, updateDetalleOrdenProduccionDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.detallesOrdenProduccionService.remove(id);
  }
}