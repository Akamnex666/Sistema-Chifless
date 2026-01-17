import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { Producto } from '../src/productos/entities/producto.entity';
import { Insumo } from '../src/insumos/entities/insumo.entity';
import { ProductoInsumo } from '../src/productos-insumos/entities/productos-insumo.entity';
import { DetalleOrdenProduccion } from '../src/detalles-orden-produccion/entities/detalles-orden-produccion.entity';
import { Server } from 'http';

jest.setTimeout(30000);

interface OrdenResponse {
  id: number;
  detalles: Array<{ insumoId: number; cantidad_utilizada: number }>;
}

describe('OrdenesProduccion E2E', () => {
  let app: INestApplication;
  let server: Server;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('chifles');
    await app.init();
    server = app.getHttpServer() as Server;
    dataSource = moduleRef.get(DataSource);
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      try {
        // Usar CASCADE en cada delete en lugar de clear() que usa TRUNCATE
        const detalleRepo = dataSource.getRepository(DetalleOrdenProduccion);
        const productoInsumoRepo = dataSource.getRepository(ProductoInsumo);
        const insumoRepo = dataSource.getRepository(Insumo);
        const productoRepo = dataSource.getRepository(Producto);

        // Eliminar en orden inverso de dependencias
        const detalles = await detalleRepo.find();
        for (const detalle of detalles) {
          await detalleRepo.remove(detalle);
        }

        const productosInsumos = await productoInsumoRepo.find();
        for (const pi of productosInsumos) {
          await productoInsumoRepo.remove(pi);
        }

        const insumos = await insumoRepo.find();
        for (const insumo of insumos) {
          await insumoRepo.remove(insumo);
        }

        const productos = await productoRepo.find();
        for (const producto of productos) {
          await productoRepo.remove(producto);
        }
      } catch (error) {
        console.error('Error en cleanup:', error);
      }
    }
    await app.close();
  });

  it.skip('crea producto, insumo, producto-insumo y genera detalles al crear orden', async () => {
    // TODO: Este test requiere autenticación JWT. Agregar mock del AuthGuard o token de prueba
    // 1) Crear producto
    const prodResp = await request(server)
      .post('/chifles/productos')
      .send({
        nombre: 'E2EProd',
        descripcion: 'producto e2e',
        precio: 2.5,
        categoria: 'snack',
        unidad_medida: 'kg',
      })
      .expect(201);

    const productoId = (prodResp.body as { id: number }).id;

    // 2) Crear insumo
    const insResp = await request(server)
      .post('/chifles/insumos')
      .send({ nombre: 'E2EHarina', unidad_medida: 'kg', stock: 100 })
      .expect(201);
    const insumoId = (insResp.body as { id: number }).id;

    // 3) Crear producto-insumo (receta)
    await request(server)
      .post('/chifles/productos-insumos')
      .send({ productoId, insumoId, cantidad_necesaria: 0.25 })
      .expect(201);

    // 4) Crear orden de produccion
    const ordenResp = await request(server)
      .post('/chifles/ordenes-produccion')
      .send({
        fecha_inicio: '2025-11-10',
        fecha_fin: '2025-11-11',
        productoId,
        cantidad_producir: 4,
      })
      .expect(201);

    const ordenBody = ordenResp.body as OrdenResponse;
    expect(ordenBody).toHaveProperty('detalles');
    expect(Array.isArray(ordenBody.detalles)).toBe(true);
    expect(ordenBody.detalles.length).toBeGreaterThan(0);

    const detalle = ordenBody.detalles.find((d) => d.insumoId === insumoId);
    expect(detalle).toBeDefined();
    // cantidad_utilizada = 0.25 * 4 = 1.0
    expect(Number(detalle?.cantidad_utilizada)).toBeCloseTo(1.0);
  });
});
