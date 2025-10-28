import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Factura } from './entities/factura.entity';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';

@Injectable()
export class FacturasService {
  constructor(
    @InjectRepository(Factura)
    private facturaRepository: Repository<Factura>,
  ) {}

  async findAll(): Promise<Factura[]> {
    return this.facturaRepository.find({
      relations: ['cliente', 'pedido'],
    });
  }

  async findOne(id: number): Promise<Factura> {
    const factura = await this.facturaRepository.findOne({
      where: { id },
      relations: ['cliente', 'pedido'],
    });
    if (!factura) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    }
    return factura;
  }

  async create(createFacturaDto: CreateFacturaDto): Promise<Factura> {
    const factura = this.facturaRepository.create(createFacturaDto);
    return await this.facturaRepository.save(factura);
  }

  async update(id: number, updateFacturaDto: UpdateFacturaDto): Promise<Factura> {
    await this.facturaRepository.update(id, updateFacturaDto);
    const updatedFactura = await this.findOne(id);
    if (!updatedFactura) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    }
    return updatedFactura;
  }

  async remove(id: number): Promise<void> {
    const result = await this.facturaRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    }
  }
}