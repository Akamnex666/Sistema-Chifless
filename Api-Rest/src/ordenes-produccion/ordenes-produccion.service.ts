import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdenProduccion } from './entities/ordenes-produccion.entity';
import { CreateOrdenProduccionDto } from './dto/create-ordenes-produccion.dto';
import { UpdateOrdenProduccionDto } from './dto/update-ordenes-produccion.dto';

@Injectable()
export class OrdenesProduccionService {
  constructor(
    @InjectRepository(OrdenProduccion)
    private ordenProduccionRepository: Repository<OrdenProduccion>,
  ) {}

  async findAll(): Promise<OrdenProduccion[]> {
    return this.ordenProduccionRepository.find({
      relations: ['producto', 'detalles'],
    });
  }

  async findOne(id: number): Promise<OrdenProduccion> {
    const orden = await this.ordenProduccionRepository.findOne({
      where: { id },
      relations: ['producto', 'detalles'],
    });
    if (!orden) {
      throw new NotFoundException(`Orden de producción con ID ${id} no encontrada`);
    }
    return orden;
  }

  async create(createOrdenProduccionDto: CreateOrdenProduccionDto): Promise<OrdenProduccion> {
    const orden = this.ordenProduccionRepository.create(createOrdenProduccionDto);
    return await this.ordenProduccionRepository.save(orden);
  }

  async update(id: number, updateOrdenProduccionDto: UpdateOrdenProduccionDto): Promise<OrdenProduccion> {
    await this.ordenProduccionRepository.update(id, updateOrdenProduccionDto);
    const updatedOrden = await this.findOne(id);
    if (!updatedOrden) {
      throw new NotFoundException(`Orden de producción con ID ${id} no encontrada`);
    }
    return updatedOrden;
  }

  async remove(id: number): Promise<void> {
    const result = await this.ordenProduccionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Orden de producción con ID ${id} no encontrada`);
    }
  }
}