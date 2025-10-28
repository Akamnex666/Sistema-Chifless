import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { PedidosService } from './pedido.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Get()
  findAll() {
    return this.pedidosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pedidosService.findOne(Number(id));
  }

  @Post()
  create(@Body() body: CreatePedidoDto) {
    return this.pedidosService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdatePedidoDto) {
    return this.pedidosService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pedidosService.remove(Number(id));
  }
}
