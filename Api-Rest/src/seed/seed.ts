import { DataSource } from 'typeorm';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Insumo } from '../insumos/entities/insumo.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { DetallePedido } from '../detalles-pedido/entities/detalles-pedido.entity';
import { Factura } from '../factura/entities/factura.entity';
import { ProductoInsumo } from '../productos-insumos/entities/productos-insumo.entity';
import { OrdenProduccion } from '../ordenes-produccion/entities/ordenes-produccion.entity';
import { DetalleOrdenProduccion } from '../detalles-orden-produccion/entities/detalles-orden-produccion.entity';
import * as dotenv from 'dotenv';

dotenv.config();

// ============ DATOS DE SEED PARA CHIFLERÍA ============

const clientes: Partial<Cliente>[] = [
  {
    nombre: 'María',
    apellido: 'González Pérez',
    dni: '0912345678',
    telefono: '0991234567',
    email: 'maria.gonzalez@email.com',
  },
  {
    nombre: 'Carlos',
    apellido: 'Rodríguez López',
    dni: '0923456789',
    telefono: '0992345678',
    email: 'carlos.rodriguez@email.com',
  },
  {
    nombre: 'Ana',
    apellido: 'Martínez Silva',
    dni: '0934567890',
    telefono: '0993456789',
    email: 'ana.martinez@email.com',
  },
  {
    nombre: 'José',
    apellido: 'Fernández Castro',
    dni: '0945678901',
    telefono: '0994567890',
    email: 'jose.fernandez@email.com',
  },
  {
    nombre: 'Laura',
    apellido: 'Sánchez Mora',
    dni: '0956789012',
    telefono: '0995678901',
    email: 'laura.sanchez@email.com',
  },
  {
    nombre: 'Pedro',
    apellido: 'Díaz Vargas',
    dni: '0967890123',
    telefono: '0996789012',
    email: 'pedro.diaz@email.com',
  },
  {
    nombre: 'Sofía',
    apellido: 'Torres Mendoza',
    dni: '0978901234',
    telefono: '0997890123',
    email: 'sofia.torres@email.com',
  },
  {
    nombre: 'Miguel',
    apellido: 'Ramírez Flores',
    dni: '0989012345',
    telefono: '0998901234',
    email: 'miguel.ramirez@email.com',
  },
  {
    nombre: 'Carmen',
    apellido: 'Herrera Paz',
    dni: '0990123456',
    telefono: '0999012345',
    email: 'carmen.herrera@email.com',
  },
  {
    nombre: 'Diego',
    apellido: 'Vega Córdoba',
    dni: '0901234567',
    telefono: '0990123456',
    email: 'diego.vega@email.com',
  },
];

const insumos: Partial<Insumo>[] = [
  {
    nombre: 'Plátano Verde',
    unidad_medida: 'kg',
    stock: 500,
    estado: 'activo',
  },
  {
    nombre: 'Plátano Maduro',
    unidad_medida: 'kg',
    stock: 300,
    estado: 'activo',
  },
  {
    nombre: 'Aceite Vegetal',
    unidad_medida: 'litros',
    stock: 200,
    estado: 'activo',
  },
  { nombre: 'Sal Fina', unidad_medida: 'kg', stock: 50, estado: 'activo' },
  { nombre: 'Azúcar', unidad_medida: 'kg', stock: 80, estado: 'activo' },
  {
    nombre: 'Canela en Polvo',
    unidad_medida: 'kg',
    stock: 10,
    estado: 'activo',
  },
  { nombre: 'Ajo en Polvo', unidad_medida: 'kg', stock: 15, estado: 'activo' },
  {
    nombre: 'Chile en Polvo',
    unidad_medida: 'kg',
    stock: 12,
    estado: 'activo',
  },
  { nombre: 'Limón', unidad_medida: 'unidades', stock: 200, estado: 'activo' },
  {
    nombre: 'Empaque Biodegradable',
    unidad_medida: 'unidades',
    stock: 1000,
    estado: 'activo',
  },
];

const productos: Partial<Producto>[] = [
  {
    nombre: 'Chifles Clásicos Salados',
    descripcion: 'Chifles de plátano verde crujientes con sal marina',
    precio: 2.5,
    categoria: 'Salados',
    unidad_medida: 'funda 100g',
    estado: 'activo',
  },
  {
    nombre: 'Chifles con Ajo',
    descripcion: 'Chifles de plátano verde con toque de ajo',
    precio: 2.75,
    categoria: 'Salados',
    unidad_medida: 'funda 100g',
    estado: 'activo',
  },
  {
    nombre: 'Chifles Picantes',
    descripcion: 'Chifles con chile y limón, sabor intenso',
    precio: 3.0,
    categoria: 'Salados',
    unidad_medida: 'funda 100g',
    estado: 'activo',
  },
  {
    nombre: 'Chifles de Maduro',
    descripcion: 'Chifles dulces de plátano maduro caramelizado',
    precio: 3.25,
    categoria: 'Dulces',
    unidad_medida: 'funda 100g',
    estado: 'activo',
  },
  {
    nombre: 'Chifles con Canela',
    descripcion: 'Chifles dulces espolvoreados con canela y azúcar',
    precio: 3.5,
    categoria: 'Dulces',
    unidad_medida: 'funda 100g',
    estado: 'activo',
  },
  {
    nombre: 'Mix Chifles Salados',
    descripcion: 'Combinación de chifles clásicos, ajo y picantes',
    precio: 4.5,
    categoria: 'Mix',
    unidad_medida: 'funda 200g',
    estado: 'activo',
  },
  {
    nombre: 'Mix Chifles Dulces',
    descripcion: 'Combinación de chifles de maduro y canela',
    precio: 5.0,
    categoria: 'Mix',
    unidad_medida: 'funda 200g',
    estado: 'activo',
  },
  {
    nombre: 'Chifles Familiar Salados',
    descripcion: 'Presentación grande de chifles clásicos',
    precio: 6.0,
    categoria: 'Familiar',
    unidad_medida: 'funda 500g',
    estado: 'activo',
  },
  {
    nombre: 'Chifles Familiar Dulces',
    descripcion: 'Presentación grande de chifles dulces surtidos',
    precio: 7.0,
    categoria: 'Familiar',
    unidad_medida: 'funda 500g',
    estado: 'activo',
  },
  {
    nombre: 'Chifles Premium Gourmet',
    descripcion: 'Edición especial con mezcla de sabores artesanales',
    precio: 8.5,
    categoria: 'Premium',
    unidad_medida: 'caja 300g',
    estado: 'activo',
  },
];

// Recetas: qué insumos necesita cada producto
const productosInsumos: {
  productoIndex: number;
  insumoIndex: number;
  cantidad_necesaria: number;
}[] = [
  // Chifles Clásicos Salados (producto 0)
  { productoIndex: 0, insumoIndex: 0, cantidad_necesaria: 0.15 }, // Plátano Verde
  { productoIndex: 0, insumoIndex: 2, cantidad_necesaria: 0.05 }, // Aceite
  { productoIndex: 0, insumoIndex: 3, cantidad_necesaria: 0.005 }, // Sal
  { productoIndex: 0, insumoIndex: 9, cantidad_necesaria: 1 }, // Empaque

  // Chifles con Ajo (producto 1)
  { productoIndex: 1, insumoIndex: 0, cantidad_necesaria: 0.15 },
  { productoIndex: 1, insumoIndex: 2, cantidad_necesaria: 0.05 },
  { productoIndex: 1, insumoIndex: 3, cantidad_necesaria: 0.003 },
  { productoIndex: 1, insumoIndex: 6, cantidad_necesaria: 0.005 }, // Ajo
  { productoIndex: 1, insumoIndex: 9, cantidad_necesaria: 1 },

  // Chifles Picantes (producto 2)
  { productoIndex: 2, insumoIndex: 0, cantidad_necesaria: 0.15 },
  { productoIndex: 2, insumoIndex: 2, cantidad_necesaria: 0.05 },
  { productoIndex: 2, insumoIndex: 3, cantidad_necesaria: 0.003 },
  { productoIndex: 2, insumoIndex: 7, cantidad_necesaria: 0.008 }, // Chile
  { productoIndex: 2, insumoIndex: 8, cantidad_necesaria: 2 }, // Limón
  { productoIndex: 2, insumoIndex: 9, cantidad_necesaria: 1 },

  // Chifles de Maduro (producto 3)
  { productoIndex: 3, insumoIndex: 1, cantidad_necesaria: 0.18 }, // Plátano Maduro
  { productoIndex: 3, insumoIndex: 2, cantidad_necesaria: 0.05 },
  { productoIndex: 3, insumoIndex: 4, cantidad_necesaria: 0.01 }, // Azúcar
  { productoIndex: 3, insumoIndex: 9, cantidad_necesaria: 1 },

  // Chifles con Canela (producto 4)
  { productoIndex: 4, insumoIndex: 1, cantidad_necesaria: 0.18 },
  { productoIndex: 4, insumoIndex: 2, cantidad_necesaria: 0.05 },
  { productoIndex: 4, insumoIndex: 4, cantidad_necesaria: 0.015 },
  { productoIndex: 4, insumoIndex: 5, cantidad_necesaria: 0.003 }, // Canela
  { productoIndex: 4, insumoIndex: 9, cantidad_necesaria: 1 },

  // Mix Salados (producto 5)
  { productoIndex: 5, insumoIndex: 0, cantidad_necesaria: 0.3 },
  { productoIndex: 5, insumoIndex: 2, cantidad_necesaria: 0.1 },
  { productoIndex: 5, insumoIndex: 3, cantidad_necesaria: 0.008 },
  { productoIndex: 5, insumoIndex: 6, cantidad_necesaria: 0.003 },
  { productoIndex: 5, insumoIndex: 7, cantidad_necesaria: 0.003 },
  { productoIndex: 5, insumoIndex: 9, cantidad_necesaria: 1 },

  // Mix Dulces (producto 6)
  { productoIndex: 6, insumoIndex: 1, cantidad_necesaria: 0.35 },
  { productoIndex: 6, insumoIndex: 2, cantidad_necesaria: 0.1 },
  { productoIndex: 6, insumoIndex: 4, cantidad_necesaria: 0.02 },
  { productoIndex: 6, insumoIndex: 5, cantidad_necesaria: 0.005 },
  { productoIndex: 6, insumoIndex: 9, cantidad_necesaria: 1 },

  // Familiar Salados (producto 7)
  { productoIndex: 7, insumoIndex: 0, cantidad_necesaria: 0.7 },
  { productoIndex: 7, insumoIndex: 2, cantidad_necesaria: 0.25 },
  { productoIndex: 7, insumoIndex: 3, cantidad_necesaria: 0.02 },
  { productoIndex: 7, insumoIndex: 9, cantidad_necesaria: 1 },

  // Familiar Dulces (producto 8)
  { productoIndex: 8, insumoIndex: 1, cantidad_necesaria: 0.8 },
  { productoIndex: 8, insumoIndex: 2, cantidad_necesaria: 0.25 },
  { productoIndex: 8, insumoIndex: 4, cantidad_necesaria: 0.05 },
  { productoIndex: 8, insumoIndex: 5, cantidad_necesaria: 0.01 },
  { productoIndex: 8, insumoIndex: 9, cantidad_necesaria: 1 },

  // Premium Gourmet (producto 9)
  { productoIndex: 9, insumoIndex: 0, cantidad_necesaria: 0.2 },
  { productoIndex: 9, insumoIndex: 1, cantidad_necesaria: 0.2 },
  { productoIndex: 9, insumoIndex: 2, cantidad_necesaria: 0.15 },
  { productoIndex: 9, insumoIndex: 3, cantidad_necesaria: 0.005 },
  { productoIndex: 9, insumoIndex: 4, cantidad_necesaria: 0.01 },
  { productoIndex: 9, insumoIndex: 5, cantidad_necesaria: 0.003 },
  { productoIndex: 9, insumoIndex: 9, cantidad_necesaria: 1 },
];

async function seed() {
  console.log('🌱 Iniciando seed de datos para Chiflería...\n');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
    database: process.env.DB_NAME || 'sistema-chifles',
    entities: [
      Cliente,
      Producto,
      Insumo,
      Pedido,
      DetallePedido,
      Factura,
      ProductoInsumo,
      OrdenProduccion,
      DetalleOrdenProduccion,
    ],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('✅ Conexión a base de datos establecida\n');

  // Repositories
  const clienteRepo = dataSource.getRepository(Cliente);
  const productoRepo = dataSource.getRepository(Producto);
  const insumoRepo = dataSource.getRepository(Insumo);
  const pedidoRepo = dataSource.getRepository(Pedido);
  const detallePedidoRepo = dataSource.getRepository(DetallePedido);
  const facturaRepo = dataSource.getRepository(Factura);
  const productoInsumoRepo = dataSource.getRepository(ProductoInsumo);
  const ordenProduccionRepo = dataSource.getRepository(OrdenProduccion);
  const detalleOrdenRepo = dataSource.getRepository(DetalleOrdenProduccion);

  // 1. Insertar Clientes
  console.log('👥 Insertando clientes...');
  const clientesGuardados = await clienteRepo.save(clientes);
  console.log(`   ✓ ${clientesGuardados.length} clientes creados\n`);

  // 2. Insertar Insumos
  console.log('📦 Insertando insumos...');
  const insumosGuardados = await insumoRepo.save(insumos);
  console.log(`   ✓ ${insumosGuardados.length} insumos creados\n`);

  // 3. Insertar Productos
  console.log('🍌 Insertando productos...');
  const productosGuardados = await productoRepo.save(productos);
  console.log(`   ✓ ${productosGuardados.length} productos creados\n`);

  // 4. Insertar Recetas (ProductoInsumo)
  console.log('📋 Insertando recetas (producto-insumo)...');
  const recetas = productosInsumos.map((pi) => ({
    productoId: productosGuardados[pi.productoIndex].id,
    insumoId: insumosGuardados[pi.insumoIndex].id,
    cantidad_necesaria: pi.cantidad_necesaria,
  }));
  const recetasGuardadas = await productoInsumoRepo.save(recetas);
  console.log(`   ✓ ${recetasGuardadas.length} recetas creadas\n`);

  // 5. Insertar Pedidos con Detalles
  console.log('🛒 Insertando pedidos...');
  const pedidosData = [
    {
      clienteIndex: 0,
      fecha: '2026-01-05',
      estado: 'completado',
      productos: [
        { index: 0, cantidad: 5 },
        { index: 3, cantidad: 3 },
      ],
    },
    {
      clienteIndex: 1,
      fecha: '2026-01-06',
      estado: 'completado',
      productos: [
        { index: 1, cantidad: 10 },
        { index: 2, cantidad: 5 },
      ],
    },
    {
      clienteIndex: 2,
      fecha: '2026-01-07',
      estado: 'pendiente',
      productos: [
        { index: 5, cantidad: 4 },
        { index: 6, cantidad: 4 },
      ],
    },
    {
      clienteIndex: 3,
      fecha: '2026-01-08',
      estado: 'completado',
      productos: [
        { index: 7, cantidad: 2 },
        { index: 8, cantidad: 2 },
      ],
    },
    {
      clienteIndex: 4,
      fecha: '2026-01-09',
      estado: 'en_proceso',
      productos: [{ index: 9, cantidad: 3 }],
    },
    {
      clienteIndex: 5,
      fecha: '2026-01-10',
      estado: 'completado',
      productos: [
        { index: 0, cantidad: 20 },
        { index: 1, cantidad: 15 },
      ],
    },
    {
      clienteIndex: 6,
      fecha: '2026-01-11',
      estado: 'pendiente',
      productos: [
        { index: 3, cantidad: 8 },
        { index: 4, cantidad: 8 },
      ],
    },
    {
      clienteIndex: 7,
      fecha: '2026-01-12',
      estado: 'completado',
      productos: [{ index: 5, cantidad: 6 }],
    },
    {
      clienteIndex: 8,
      fecha: '2026-01-13',
      estado: 'en_proceso',
      productos: [
        { index: 7, cantidad: 5 },
        { index: 9, cantidad: 2 },
      ],
    },
    {
      clienteIndex: 9,
      fecha: '2026-01-13',
      estado: 'pendiente',
      productos: [
        { index: 0, cantidad: 50 },
        { index: 2, cantidad: 30 },
      ],
    },
  ];

  const pedidosGuardados: Pedido[] = [];
  for (const pd of pedidosData) {
    let total = 0;
    const detalles: Partial<DetallePedido>[] = pd.productos.map((p) => {
      const producto = productosGuardados[p.index];
      const subtotal = Number(producto.precio) * p.cantidad;
      total += subtotal;
      return {
        productoId: producto.id,
        cantidad_solicitada: p.cantidad,
        precio_unitario: producto.precio,
        subtotal: subtotal,
      };
    });

    const pedido = await pedidoRepo.save({
      clienteId: clientesGuardados[pd.clienteIndex].id,
      fecha: pd.fecha,
      estado: pd.estado,
      total: total,
    });

    // Guardar detalles
    for (const det of detalles) {
      await detallePedidoRepo.save({ ...det, pedidoId: pedido.id });
    }

    pedidosGuardados.push(pedido);
  }
  console.log(`   ✓ ${pedidosGuardados.length} pedidos creados\n`);

  // 6. Insertar Facturas (para pedidos completados)
  console.log('🧾 Insertando facturas...');
  const pedidosCompletados = pedidosGuardados.filter(
    (_, i) => pedidosData[i].estado === 'completado',
  );
  const facturasGuardadas: Factura[] = [];
  for (const pedido of pedidosCompletados) {
    const factura = await facturaRepo.save({
      fecha_emision: pedido.fecha,
      total: pedido.total,
      estado_pago: 'pagado',
      clienteId: pedido.clienteId,
      pedidoId: pedido.id,
    });
    // Actualizar pedido con facturaId
    await pedidoRepo.update(pedido.id, { facturaId: factura.id });
    facturasGuardadas.push(factura);
  }
  console.log(`   ✓ ${facturasGuardadas.length} facturas creadas\n`);

  // 7. Insertar Órdenes de Producción
  console.log('🏭 Insertando órdenes de producción...');
  const ordenesData = [
    {
      productoIndex: 0,
      cantidad: 100,
      estado: 'completada',
      fechaInicio: '2026-01-02',
      fechaFin: '2026-01-03',
    },
    {
      productoIndex: 1,
      cantidad: 80,
      estado: 'completada',
      fechaInicio: '2026-01-03',
      fechaFin: '2026-01-04',
    },
    {
      productoIndex: 2,
      cantidad: 60,
      estado: 'completada',
      fechaInicio: '2026-01-04',
      fechaFin: '2026-01-05',
    },
    {
      productoIndex: 3,
      cantidad: 50,
      estado: 'completada',
      fechaInicio: '2026-01-05',
      fechaFin: '2026-01-06',
    },
    {
      productoIndex: 4,
      cantidad: 50,
      estado: 'completada',
      fechaInicio: '2026-01-06',
      fechaFin: '2026-01-07',
    },
    {
      productoIndex: 5,
      cantidad: 40,
      estado: 'en_proceso',
      fechaInicio: '2026-01-10',
      fechaFin: '2026-01-12',
    },
    {
      productoIndex: 6,
      cantidad: 40,
      estado: 'en_proceso',
      fechaInicio: '2026-01-11',
      fechaFin: '2026-01-13',
    },
    {
      productoIndex: 7,
      cantidad: 30,
      estado: 'pendiente',
      fechaInicio: '2026-01-14',
      fechaFin: '2026-01-16',
    },
    {
      productoIndex: 8,
      cantidad: 25,
      estado: 'pendiente',
      fechaInicio: '2026-01-15',
      fechaFin: '2026-01-17',
    },
    {
      productoIndex: 9,
      cantidad: 20,
      estado: 'pendiente',
      fechaInicio: '2026-01-16',
      fechaFin: '2026-01-18',
    },
  ];

  const ordenesGuardadas: OrdenProduccion[] = [];
  for (const od of ordenesData) {
    const orden = await ordenProduccionRepo.save({
      productoId: productosGuardados[od.productoIndex].id,
      cantidad_producir: od.cantidad,
      estado: od.estado,
      fecha_inicio: od.fechaInicio,
      fecha_fin: od.fechaFin,
    });
    ordenesGuardadas.push(orden);
  }
  console.log(
    `   ✓ ${ordenesGuardadas.length} órdenes de producción creadas\n`,
  );

  // 8. Insertar Detalles de Órdenes de Producción
  console.log('📝 Insertando detalles de órdenes de producción...');
  let totalDetallesOrden = 0;
  for (let i = 0; i < ordenesGuardadas.length; i++) {
    const orden = ordenesGuardadas[i];
    const productoIndex = ordenesData[i].productoIndex;

    // Obtener receta del producto
    const recetaProducto = productosInsumos.filter(
      (pi) => pi.productoIndex === productoIndex,
    );

    for (const receta of recetaProducto) {
      await detalleOrdenRepo.save({
        ordenProduccionId: orden.id,
        insumoId: insumosGuardados[receta.insumoIndex].id,
        cantidad_utilizada: receta.cantidad_necesaria * ordenesData[i].cantidad,
      });
      totalDetallesOrden++;
    }
  }
  console.log(`   ✓ ${totalDetallesOrden} detalles de orden creados\n`);

  await dataSource.destroy();

  console.log('═'.repeat(50));
  console.log('🎉 ¡Seed completado exitosamente!');
  console.log('═'.repeat(50));
  console.log('\n📊 Resumen:');
  console.log(`   • Clientes: ${clientesGuardados.length}`);
  console.log(`   • Insumos: ${insumosGuardados.length}`);
  console.log(`   • Productos: ${productosGuardados.length}`);
  console.log(`   • Recetas: ${recetasGuardadas.length}`);
  console.log(`   • Pedidos: ${pedidosGuardados.length}`);
  console.log(`   • Facturas: ${facturasGuardadas.length}`);
  console.log(`   • Órdenes de producción: ${ordenesGuardadas.length}`);
  console.log(`   • Detalles de órdenes: ${totalDetallesOrden}`);
}

seed().catch((err) => {
  console.error('❌ Error durante el seed:', err);
  process.exit(1);
});
