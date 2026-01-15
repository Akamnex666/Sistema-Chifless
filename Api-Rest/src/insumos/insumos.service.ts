import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Insumo } from './entities/insumo.entity';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { UpdateInsumoDto } from './dto/update-insumo.dto';

@Injectable()
export class InsumosService {
  constructor(
    @InjectRepository(Insumo)
    private insumoRepository: Repository<Insumo>,
  ) {}

  async findAll(): Promise<Insumo[]> {
    return this.insumoRepository.find();
  }

  async findOne(id: number): Promise<Insumo> {
    const insumo = await this.insumoRepository.findOne({ where: { id } });
    if (!insumo) {
      throw new NotFoundException(`Insumo con ID ${id} no encontrado`);
    }
    return insumo;
  }

  async create(createInsumoDto: CreateInsumoDto): Promise<Insumo> {
    const insumo = this.insumoRepository.create(createInsumoDto);
    return await this.insumoRepository.save(insumo);
  }

  async update(id: number, updateInsumoDto: UpdateInsumoDto): Promise<Insumo> {
    await this.insumoRepository.update(id, updateInsumoDto);
    const updatedInsumo = await this.findOne(id);
    if (!updatedInsumo) {
      throw new NotFoundException(`Insumo con ID ${id} no encontrado`);
    }
    return updatedInsumo;
  }

  async remove(id: number): Promise<void> {
    const result = await this.insumoRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Insumo con ID ${id} no encontrado`);
    }
  }
}
