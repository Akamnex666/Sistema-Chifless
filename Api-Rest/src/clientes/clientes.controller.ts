import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Patch,
  ParseIntPipe,
  Headers,
  Logger,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

import { notifyWebSocket } from '../utils/notify-ws';

@ApiBearerAuth()
@Controller('clientes')
export class ClientesController {
  private readonly logger = new Logger(ClientesController.name);

  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  findAll() {
    return this.clientesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.findOne(id);
  }

  @Post()
  async create(@Body() body: CreateClienteDto) {
    const nuevoCliente = await this.clientesService.create(body);

    await notifyWebSocket('client.created', nuevoCliente);

    return nuevoCliente;
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateClienteDto,
  ) {
    this.logger.log(`PUT /clientes/${id} - payload: ${JSON.stringify(body)}`);
    const actualizado = await this.clientesService.update(id, body);

    this.logger.log(`PUT /clientes/${id} - result id: ${actualizado?.id}`);

    await notifyWebSocket('client.updated', actualizado);

    return actualizado;
  }

  @Patch(':id')
  async partialUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateClienteDto,
    @Headers('authorization') authorization?: string,
  ) {
    // Delegar a la misma lógica de update para aceptar PATCH desde clientes externos
    this.logger.log(
      `PATCH /clientes/${id} - payload: ${JSON.stringify(body)} - auth:${authorization}`,
    );

    const actualizado = await this.clientesService.update(id, body);

    this.logger.log(`PATCH /clientes/${id} - result id: ${actualizado?.id}`);

    await notifyWebSocket('client.updated', actualizado);

    return actualizado;
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.clientesService.remove(id);

    await notifyWebSocket('client.deleted', { id });

    return { deleted: true };
  }
}
