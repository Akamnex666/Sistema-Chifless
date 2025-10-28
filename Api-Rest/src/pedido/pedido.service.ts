import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private pedidoRepository: Repository<Pedido>,
  ) {}

  findAll() {
    return this.pedidoRepository.find();
  }

  async findOne(id: number) {
    const pedido = await this.pedidoRepository.findOneBy({ id });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    return pedido;
  }

  create(data: CreatePedidoDto) {
    const nuevoPedido = this.pedidoRepository.create(data);
    return this.pedidoRepository.save(nuevoPedido);
  }

  async update(id: number, data: UpdatePedidoDto) {
    await this.pedidoRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.pedidoRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('Pedido no encontrado');
    return { deleted: true };
  }
}
