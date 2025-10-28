import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetalleOrdenProduccion } from './entities/detalles-orden-produccion.entity';
import { CreateDetalleOrdenProduccionDto } from './dto/create-detalles-orden-produccion.dto';
import { UpdateDetalleOrdenProduccionDto } from './dto/update-detalles-orden-produccion.dto';

@Injectable()
export class DetallesOrdenProduccionService {
  constructor(
    @InjectRepository(DetalleOrdenProduccion)
    private detalleOrdenProduccionRepository: Repository<DetalleOrdenProduccion>,
  ) {}

  async findAll(): Promise<DetalleOrdenProduccion[]> {
    return this.detalleOrdenProduccionRepository.find({
      relations: ['ordenProduccion', 'insumo'],
    });
  }

  async findOne(id: number): Promise<DetalleOrdenProduccion> {
    const detalle = await this.detalleOrdenProduccionRepository.findOne({
      where: { id },
      relations: ['ordenProduccion', 'insumo'],
    });
    if (!detalle) {
      throw new NotFoundException(`Detalle de orden de producción con ID ${id} no encontrado`);
    }
    return detalle;
  }

  async create(createDetalleOrdenProduccionDto: CreateDetalleOrdenProduccionDto): Promise<DetalleOrdenProduccion> {
    const detalle = this.detalleOrdenProduccionRepository.create(createDetalleOrdenProduccionDto);
    return await this.detalleOrdenProduccionRepository.save(detalle);
  }

  async update(id: number, updateDetalleOrdenProduccionDto: UpdateDetalleOrdenProduccionDto): Promise<DetalleOrdenProduccion> {
    await this.detalleOrdenProduccionRepository.update(id, updateDetalleOrdenProduccionDto);
    const updatedDetalle = await this.findOne(id);
    if (!updatedDetalle) {
      throw new NotFoundException(`Detalle de orden de producción con ID ${id} no encontrado`);
    }
    return updatedDetalle;
  }

  async remove(id: number): Promise<void> {
    const result = await this.detalleOrdenProduccionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Detalle de orden de producción con ID ${id} no encontrado`);
    }
  }

  async findByOrdenProduccion(ordenProduccionId: number): Promise<DetalleOrdenProduccion[]> {
    return this.detalleOrdenProduccionRepository.find({
      where: { ordenProduccionId },
      relations: ['insumo'],
    });
  }
}