import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { notifyWebSocket } from '../utils/notify-ws';
import { Public } from '../auth/public.decorator';

@Controller('pedidos')
@ApiBearerAuth()
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Public()
  @Post()
  async create(@Body() dto: CreatePedidoDto) {
    const nuevo = await this.pedidosService.createWithDetalles(dto);
    await notifyWebSocket('order.created', nuevo);
    return nuevo;
  }

  @Public()
  @Get()
  findAll() {
    return this.pedidosService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pedidosService.findOne(id);
  }

  @Public()
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePedidoDto,
  ) {
    const actualizado = await this.pedidosService.update(id, dto);

    // Detectar estado y notificar acorde
    switch (actualizado.estado) {
      case 'en proceso':
        await notifyWebSocket('order.updated', actualizado);
        break;
      case 'listo':
        await notifyWebSocket('order.completed', actualizado);
        break;
      case 'cancelado':
        await notifyWebSocket('order.cancelled', actualizado);
        break;
      case 'pagado':
        await notifyWebSocket('order.paid', actualizado);
        break;
    }

    return actualizado;
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pedidosService.remove(id);
  }
}
