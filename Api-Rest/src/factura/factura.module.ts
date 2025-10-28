import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturasService } from './factura.service';
import { FacturasController } from './factura.controller';
import { Factura } from './entities/factura.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Factura])],
  controllers: [FacturasController],
  providers: [FacturasService],
  exports: [FacturasService],
})
export class FacturasModule {}