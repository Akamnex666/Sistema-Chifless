import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosInsumosService } from './productos-insumos.service';
import { ProductosInsumosController } from './productos-insumos.controller';
import { ProductoInsumo } from './entities/productos-insumo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductoInsumo])],
  controllers: [ProductosInsumosController],
  providers: [ProductosInsumosService],
  exports: [ProductosInsumosService],
})
export class ProductosInsumosModule {}
