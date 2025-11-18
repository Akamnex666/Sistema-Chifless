# Sistema de Gestión de Chifles - Frontend

Frontend completo desarrollado con **Next.js 16**, **React 19**, **TypeScript** y **Tailwind CSS** que integra todas las capas del sistema:

- 🔄 **REST API** (NestJS) - Operaciones CRUD
- 📊 **GraphQL** (FastAPI + Strawberry) - Reportes y análisis
- ⚡ **WebSocket** (Go) - Notificaciones en tiempo real

## 🚀 Características

### Integraciones

1. **REST API**: Todas las operaciones CRUD para:
   - Clientes
   - Productos
   - Insumos
   - Pedidos
   - Órdenes de Producción
   - Facturas

2. **GraphQL**: Reportes avanzados con:
   - Reporte de ventas
   - Reporte de producción
   - Reporte de inventario
   - Productos más vendidos
   - Insumos más utilizados
   - Alertas de stock bajo

3. **WebSocket**: Notificaciones en tiempo real para:
   - Nuevos pedidos
   - Cambios de estado
   - Alertas de inventario
   - Actualizaciones del sistema

### Tecnologías Utilizadas

- **Next.js 16** con App Router
- **React 19** con React Compiler
- **TypeScript** para type safety
- **Tailwind CSS** para estilos
- **TanStack Query (React Query)** para gestión de estado del servidor
- **Zustand** para estado global
- **Axios** para HTTP requests
- **Apollo Client** para GraphQL
- **Socket.io** para WebSocket
- **React Hook Form** para formularios
- **Recharts** para gráficos
- **Lucide React** para iconos
- **date-fns** para manejo de fechas

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
```

## ⚙️ Configuración

Edita el archivo `.env.local`:

```env
# API REST (NestJS)
NEXT_PUBLIC_API_REST_URL=http://localhost:3000/chifles

# GraphQL API (FastAPI)
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8001/graphql

# WebSocket Server (Go)
NEXT_PUBLIC_WS_URL=http://localhost:8081
```

## 🏃 Ejecución

```bash
# Modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Ejecutar versión de producción
npm start

# Lint
npm run lint
```

La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
src/
├── app/                      # Páginas de Next.js (App Router)
│   ├── clientes/            # Módulo de clientes
│   ├── productos/           # Módulo de productos
│   ├── insumos/             # Módulo de insumos
│   ├── pedidos/             # Módulo de pedidos
│   ├── ordenes-produccion/  # Módulo de órdenes de producción
│   ├── facturas/            # Módulo de facturas
│   ├── reportes/            # Dashboard de reportes (GraphQL)
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Página de inicio
│
├── components/              # Componentes reutilizables
│   ├── ui/                 # Componentes UI base
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Table.tsx
│   │   ├── Modal.tsx
│   │   ├── Card.tsx
│   │   └── Toast.tsx
│   ├── layout/             # Componentes de layout
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   └── Providers.tsx       # Provider de React Query
│
├── hooks/                   # Custom hooks
│   ├── useClientes.ts
│   ├── useProductos.ts
│   ├── useInsumos.ts
│   ├── usePedidos.ts
│   ├── useOrdenesProduccion.ts
│   ├── useFacturas.ts
│   ├── useReportes.ts      # Hooks GraphQL
│   └── useWebSocket.ts     # Hook WebSocket
│
├── services/                # Servicios de integración
│   ├── api.ts              # Cliente Axios (REST)
│   ├── graphql.ts          # Cliente Apollo (GraphQL)
│   └── websocket.ts        # Cliente WebSocket
│
├── store/                   # Estado global (Zustand)
│   └── notifications.ts
│
└── types/                   # Tipos TypeScript
    └── index.ts
```

## 🎨 Módulos Implementados

### 1. Clientes
- ✅ Listado con tabla
- ✅ Crear nuevo cliente
- ✅ Editar cliente
- ✅ Eliminar cliente
- ✅ Validación de formularios

### 2. Productos
- ✅ Listado con precios y stock
- ✅ CRUD completo
- ✅ Validación de campos numéricos

### 3. Insumos
- ✅ Control de inventario
- ✅ Alertas de stock bajo
- ✅ Stock mínimo configurable
- ✅ Precio unitario

### 4. Pedidos
- 📝 Estructura base creada
- 🔄 Pendiente implementación completa

### 5. Órdenes de Producción
- 📝 Estructura base creada
- 🔄 Pendiente implementación completa

### 6. Facturas
- 📝 Estructura base creada
- 🔄 Pendiente implementación completa

### 7. Dashboard de Reportes (GraphQL)
- ✅ KPIs principales
- ✅ Gráfico de ventas por día
- ✅ Productos más vendidos
- ✅ Insumos más utilizados
- ✅ Alertas de inventario
- ✅ Resumen de inventario

## 🔌 Integración con Backend

### REST API (NestJS - Puerto 3000)

```typescript
// Ejemplo de uso
import { useClientes } from '@/hooks/useClientes';

function ClientesList() {
  const { data: clientes, isLoading } = useClientes();
  // ...
}
```

### GraphQL (FastAPI - Puerto 8001)

```typescript
// Ejemplo de uso
import { useReporteVentas } from '@/hooks/useReportes';

function Dashboard() {
  const { data: reporte } = useReporteVentas('2024-01-01', '2024-12-31');
  // ...
}
```

### WebSocket (Go - Puerto 8081)

```typescript
// Ejemplo de uso
import { useWebSocket } from '@/hooks/useWebSocket';

function NotificationsComponent() {
  const { isConnected, subscribe } = useWebSocket();
  
  useEffect(() => {
    return subscribe('PEDIDO_CREATED', (data) => {
      console.log('Nuevo pedido:', data);
    });
  }, []);
}
```

## 🔐 Autenticación (JWT) — Desarrollo

En este repositorio se agregó un flujo sencillo de autenticación JWT pensado para desarrollo y pruebas rápidas.

- Endpoint dev en el backend: `POST /chifles/auth/login` → devuelve `{ access_token }`.
- Frontend guarda temporalmente el `access_token` en `localStorage` (solo desarrollo).
- El cliente HTTP `src/services/api.ts` añade automáticamente el header `Authorization: Bearer <token>` desde `localStorage`.
- Página de login (dev): `http://localhost:7171/login` (archivo `src/app/login/page.tsx`).

Flujo rápido de uso:

1. Levanta el API REST (ya sea en Docker o local). Por ejemplo:

```pwsh
cd Api-Rest
docker-compose up -d
```

2. Levanta el frontend:

```pwsh
cd frontend
npm install
npm run dev
```

3. Abre `http://localhost:7171/login`, pulsa "Entrar" (por defecto el formulario viene con credenciales de desarrollo).
4. Comprueba en DevTools → Application → Local Storage que existe la clave `access_token`.
5. Navega al dashboard o a cualquier página que haga peticiones a la API; las llamadas incluirán automáticamente el header `Authorization`.

Si prefieres tomar el token desde Swagger (útil para pruebas):

1. En Swagger realiza `POST /chifles/auth/login` y copia el `access_token` de la respuesta.
2. En la consola del navegador ejecuta:

```js
localStorage.setItem('access_token', '<TOKEN_AQUI>');
location.reload();
```

### WebSocket y token

- El cliente WebSocket (`src/services/websocket.ts`) añade el token como query param: `ws://host:port/ws?token=<token>`.
- Asegúrate de que el servidor WebSocket valide el token desde `r.URL.Query().Get("token")` y use el mismo `JWT_SECRET` del backend.

### Notas de seguridad

- Este flujo usa `localStorage` y es adecuado solo para desarrollo. Para producción se recomienda:
  - Usar cookies `HttpOnly` para el refresh token.
  - Mantener `access_token` en memoria y renovarlo con refresh token.
  - Implementar CSRF / SameSite y políticas de CORS estrictas.


## 🎯 Próximas Mejoras

- [ ] Completar módulo de Pedidos con detalles
- [ ] Completar módulo de Órdenes de Producción
- [ ] Completar módulo de Facturas
- [ ] Agregar autenticación y autorización
- [ ] Implementar paginación en tablas
- [ ] Agregar filtros y búsqueda avanzada
- [ ] Mejorar manejo de errores
- [ ] Agregar tests unitarios y de integración
- [ ] Implementar caché optimizado
- [ ] Agregar exportación de reportes (PDF/Excel)

## 📝 Notas de Desarrollo

### Manejo de Estado

- **Server State**: React Query para datos del servidor (REST y GraphQL)
- **Client State**: Zustand para estado de notificaciones
- **Form State**: React Hook Form para formularios

### Validación

- Validación en formularios con React Hook Form
- Tipado fuerte con TypeScript
- Validación en backend (NestJS con class-validator)

### Estilos

- Tailwind CSS para utility-first CSS
- Componentes UI personalizados reutilizables
- Diseño responsivo para móvil y desktop

## 🐛 Troubleshooting

### Error de conexión a API

Verifica que los servicios backend estén corriendo:

```bash
# REST API (NestJS)
cd Api-Rest
npm run start:dev

# GraphQL (FastAPI)
cd GraphQL/service
uvicorn app.main:app --reload --port 8001

# WebSocket (Go)
cd Websocket
go run main.go
```

### Error de CORS

Asegúrate de que el backend tenga CORS habilitado para `http://localhost:3000`

### WebSocket no conecta

1. Verifica que el servidor WebSocket esté corriendo en el puerto 8081
2. Revisa el archivo `.env` del servidor WebSocket
3. Verifica que `ALLOWED_ORIGIN` incluya tu frontend

## 📄 Licencia

Proyecto académico para sistema de gestión de producción de chifles.

---

Desarrollado con ❤️ usando Next.js, React y TypeScript
