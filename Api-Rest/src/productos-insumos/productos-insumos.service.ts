import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductoInsumo } from './entities/productos-insumo.entity';
import { UpdateProductoInsumoDto } from './dto/update-productos-insumo.dto';

export class CreateProductoInsumoDto {
  productoId: number;
  insumoId: number;
  cantidad?: number;
}

@Injectable()
export class ProductosInsumosService {
  constructor(
    @InjectRepository(ProductoInsumo)
    private productoInsumoRepository: Repository<ProductoInsumo>,
  ) {}

  async findAll(): Promise<ProductoInsumo[]> {
    return this.productoInsumoRepository.find({
      relations: ['producto', 'insumo'],
    });
  }

  async findOne(id: number): Promise<ProductoInsumo> {
    const productoInsumo = await this.productoInsumoRepository.findOne({
      where: { id },
      relations: ['producto', 'insumo'],
    });
    if (!productoInsumo) {
      throw new NotFoundException(`Relación Producto-Insumo con ID ${id} no encontrada`);
    }
    return productoInsumo;
  }

  async create(createProductoInsumoDto: CreateProductoInsumoDto): Promise<ProductoInsumo> {
    const productoInsumo = this.productoInsumoRepository.create(createProductoInsumoDto);
    return await this.productoInsumoRepository.save(productoInsumo);
  }

  async update(id: number, updateProductoInsumoDto: UpdateProductoInsumoDto): Promise<ProductoInsumo> {
    await this.productoInsumoRepository.update(id, updateProductoInsumoDto);
    const updatedProductoInsumo = await this.findOne(id);
    if (!updatedProductoInsumo) {
      throw new NotFoundException(`Relación Producto-Insumo con ID ${id} no encontrada`);
    }
    return updatedProductoInsumo;
  }

  async remove(id: number): Promise<void> {
    const result = await this.productoInsumoRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Relación Producto-Insumo con ID ${id} no encontrada`);
    }
  }

  async findByProducto(productoId: number): Promise<ProductoInsumo[]> {
    return this.productoInsumoRepository.find({
      where: { productoId },
      relations: ['insumo'],
    });
  }

  async findByInsumo(insumoId: number): Promise<ProductoInsumo[]> {
    return this.productoInsumoRepository.find({
      where: { insumoId },
      relations: ['producto'],
    });
  }
}