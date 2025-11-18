import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  private readonly logger = new Logger(ClientesService.name);
  constructor(
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
  ) {}

  findAll() {
    return this.clienteRepository.find();
  }

  async findOne(id: number) {
    const cliente = await this.clienteRepository.findOneBy({ id });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  }

  create(data: CreateClienteDto) {
    const nuevoCliente = this.clienteRepository.create(data);
    return this.clienteRepository.save(nuevoCliente);
  }

  async update(id: number, data: UpdateClienteDto) {
    this.logger.log(`ClientesService.update id=${id} payload=${JSON.stringify(data)}`);
    await this.clienteRepository.update(id, data);
    const result = await this.findOne(id);
    this.logger.log(`ClientesService.update result id=${result?.id} data=${JSON.stringify(result)}`);
    return result;
  }

  async remove(id: number) {
    const result = await this.clienteRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('Cliente no encontrado');
    return { deleted: true };
  }
}
