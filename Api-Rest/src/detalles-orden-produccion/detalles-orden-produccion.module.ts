import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetallesOrdenProduccionService } from './detalles-orden-produccion.service';
import { DetallesOrdenProduccionController } from './detalles-orden-produccion.controller';
import { DetalleOrdenProduccion } from './entities/detalles-orden-produccion.entity';

@Module({
	imports: [TypeOrmModule.forFeature([DetalleOrdenProduccion])],
	controllers: [DetallesOrdenProduccionController],
	providers: [DetallesOrdenProduccionService],
	exports: [DetallesOrdenProduccionService],
})
export class DetallesOrdenProduccionModule {}