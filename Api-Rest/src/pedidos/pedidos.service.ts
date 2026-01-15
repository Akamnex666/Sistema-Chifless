import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { DetallePedido } from '../detalles-pedido/entities/detalles-pedido.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido) private readonly pedidoRepo: Repository<Pedido>,
    @InjectRepository(DetallePedido)
    private readonly detalleRepo: Repository<DetallePedido>,
    private readonly dataSource: DataSource,
  ) {}

  // Crear pedido + detalles en transacción
  async createWithDetalles(dto: CreatePedidoDto): Promise<Pedido> {
    // Validaciones adicionales (ej: que cliente exista) aquí si las necesitas

    // Calcular subtotales y total por servidor (recomendado)
    dto.detalles = dto.detalles.map((d) => ({
      ...d,
      subtotal: Number(
        (d.cantidad_solicitada * Number(d.precio_unitario)).toFixed(2),
      ),
    }));

    // Recalcular total en servidor y comparar con dto.total si quieres
    const totalComputed = dto.detalles.reduce(
      (s, d) => s + Number(d.subtotal),
      0,
    );
    if (Math.abs(totalComputed - Number(dto.total)) > 0.01) {
      // Puedes decidir: ajustar total o lanzar error
      throw new BadRequestException(
        'Total no coincide con la suma de subtotales',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const pedido = this.pedidoRepo.create({
        fecha: dto.fecha,
        total: dto.total,
        estado: dto.estado,
        clienteId: dto.clienteId,
        detalles: dto.detalles, // gracias a cascade, se crearán
      });

      const saved = await queryRunner.manager.save(pedido);
      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Obtener todos (con detalles)
  async findAll(): Promise<Pedido[]> {
    return this.pedidoRepo.find(); // si no eager, usar find({ relations: ['detalles'] })
  }

  // Obtener por id
  async findOne(id: number): Promise<Pedido> {
    const pedido = await this.pedidoRepo.findOne({ where: { id } });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    return pedido;
  }

  // Actualizar (ejemplo simple: reemplazar campos y detalles)
  async update(id: number, dto: Partial<CreatePedidoDto>): Promise<Pedido> {
    const pedido = await this.pedidoRepo.findOne({ where: { id } });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');

    // Si vienen detalles: borrar los anteriores y crear los nuevos en transacción,
    // o usar lógica diffs — aquí ejemplo reemplazo completo:
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (dto.detalles) {
        // borrar detalles previos
        await queryRunner.manager.delete(DetallePedido, { pedidoId: id });
        // crear nuevos
        const nuevos = dto.detalles.map((d) => ({ ...d, pedidoId: id }));
        await queryRunner.manager.insert(DetallePedido, nuevos);
      }

      // actualizar campos del pedido
      await queryRunner.manager.update(Pedido, id, {
        fecha: dto.fecha ?? pedido.fecha,
        total: dto.total ?? pedido.total,
        estado: dto.estado ?? pedido.estado,
      });

      await queryRunner.commitTransaction();
      return await this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Eliminar pedido (detalles borrados por cascade)
  async remove(id: number) {
    const res = await this.pedidoRepo.delete(id);
    if (res.affected === 0) throw new NotFoundException('Pedido no encontrado');
    return { deleted: true };
  }
}
