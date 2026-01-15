import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetallesPedidoService } from './detalles-pedido.service';
import { DetallesPedidoController } from './detalles-pedido.controller';
import { DetallePedido } from './entities/detalles-pedido.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DetallePedido])],
  controllers: [DetallesPedidoController],
  providers: [DetallesPedidoService],
  exports: [DetallesPedidoService],
})
export class DetallesPedidoModule {}
