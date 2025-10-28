import { Controller, Get, Post, Body, Param, Delete, Put, ParseIntPipe } from '@nestjs/common';
import { OrdenesProduccionService } from './ordenes-produccion.service';
import { CreateOrdenProduccionDto } from './dto/create-ordenes-produccion.dto';
import { UpdateOrdenProduccionDto } from './dto/update-ordenes-produccion.dto';
import { OrdenProduccion } from './entities/ordenes-produccion.entity';

@Controller('ordenes-produccion')
export class OrdenesProduccionController {
  constructor(private readonly ordenesProduccionService: OrdenesProduccionService) {}

  @Get()
  findAll(): Promise<OrdenProduccion[]> {
    return this.ordenesProduccionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<OrdenProduccion> {
    return this.ordenesProduccionService.findOne(id);
  }

  @Post()
  create(@Body() createOrdenProduccionDto: CreateOrdenProduccionDto): Promise<OrdenProduccion> {
    return this.ordenesProduccionService.create(createOrdenProduccionDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrdenProduccionDto: UpdateOrdenProduccionDto,
  ): Promise<OrdenProduccion> {
    return this.ordenesProduccionService.update(id, updateOrdenProduccionDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.ordenesProduccionService.remove(id);
  }
}