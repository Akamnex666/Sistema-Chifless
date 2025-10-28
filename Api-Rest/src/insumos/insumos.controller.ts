import { Controller, Get, Post, Body, Param, Delete, Put, ParseIntPipe } from '@nestjs/common';
import { InsumosService } from './insumos.service';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { UpdateInsumoDto } from './dto/update-insumo.dto';
import { Insumo } from './entities/insumo.entity';

@Controller('insumos')
export class InsumosController {
  constructor(private readonly insumosService: InsumosService) {}

  @Get()
  findAll(): Promise<Insumo[]> {
    return this.insumosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Insumo> {
    return this.insumosService.findOne(id);
  }

  @Post()
  create(@Body() createInsumoDto: CreateInsumoDto): Promise<Insumo> {
    return this.insumosService.create(createInsumoDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInsumoDto: UpdateInsumoDto,
  ): Promise<Insumo> {
    return this.insumosService.update(id, updateInsumoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.insumosService.remove(id);
  }
}