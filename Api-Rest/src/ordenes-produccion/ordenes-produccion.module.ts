import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdenesProduccionService } from './ordenes-produccion.service';
import { OrdenesProduccionController } from './ordenes-produccion.controller';
import { OrdenProduccion } from './entities/ordenes-produccion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrdenProduccion])],
  controllers: [OrdenesProduccionController],
  providers: [OrdenesProduccionService],
  exports: [OrdenesProduccionService],
})
export class OrdenesProduccionModule {}