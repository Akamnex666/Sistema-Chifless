import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ClientesModule } from './clientes/clientes.module';
import { Cliente } from './clientes/entities/cliente.entity';
import { Pedido } from './pedidos/entities/pedido.entity';
import { Factura } from './factura/entities/factura.entity';
import { Producto } from './productos/entities/producto.entity';
import { Insumo } from './insumos/entities/insumo.entity';
import { DetallePedido } from './detalles-pedido/entities/detalles-pedido.entity';
import { ProductoInsumo } from './productos-insumos/entities/productos-insumo.entity';
import { OrdenProduccion } from './ordenes-produccion/entities/ordenes-produccion.entity';
import { DetalleOrdenProduccion } from './detalles-orden-produccion/entities/detalles-orden-produccion.entity';
import { FacturasModule } from './factura/factura.module';
import { ProductosModule } from './productos/productos.module';
import { InsumosModule } from './insumos/insumos.module';
import { DetallesPedidoModule } from './detalles-pedido/detalles-pedido.module';
import { ProductosInsumosModule } from './productos-insumos/productos-insumos.module';
import { OrdenesProduccionModule } from './ordenes-produccion/ordenes-produccion.module';
import { DetallesOrdenProduccionModule } from './detalles-orden-produccion/detalles-orden-produccion.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        Cliente,
        Pedido,
        Factura,
        Producto,
        Insumo,
        DetallePedido,
        ProductoInsumo,
        OrdenProduccion,
        DetalleOrdenProduccion,
      ],
      synchronize: true,
    }),
    ClientesModule,
    PedidosModule,
    FacturasModule,
    ProductosModule,
    InsumosModule,
    DetallesPedidoModule,
    ProductosInsumosModule,
    OrdenesProduccionModule,
    DetallesOrdenProduccionModule,
    AuthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
