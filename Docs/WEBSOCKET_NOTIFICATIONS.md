# 🔔 Sistema de Notificaciones WebSocket - Frontend

## 📋 Resumen

El sistema de notificaciones en tiempo real está completamente integrado en el frontend de Next.js, conectándose al servidor WebSocket en Go.

## ✨ Características Implementadas

### 1. **Servicio WebSocket Nativo**
- Conexión WebSocket nativa (no Socket.IO)
- Reconexión automática con backoff exponencial
- Manejo de errores y desconexiones
- Sistema de listeners para eventos específicos

### 2. **Centro de Notificaciones**
- Panel visual con diseño moderno
- Notificaciones en tiempo real
- Contador de notificaciones no leídas
- Sistema de iconos según severidad (éxito, advertencia, error)
- Marca individual o todas como leídas
- Eliminación de notificaciones
- Timestamps con formato relativo ("hace 2 minutos")

### 3. **Tipos de Eventos Soportados**

#### 📦 Productos
- `product.created` - Producto creado
- `product.updated` - Producto actualizado
- `product.deleted` - Producto eliminado
- `product.enabled` - Producto habilitado
- `product.disabled` - Producto deshabilitado

#### 🧪 Recetas (Producto-Insumo)
- `recipe.created` - Receta creada
- `recipe.updated` - Receta actualizada
- `recipe.deleted` - Receta eliminada

#### 📦 Insumos
- `supply.restocked` - Insumo reabastecido
- `supply.updated` - Insumo actualizado
- `supply.deleted` - Insumo eliminado
- `supply.low` - **⚠️ Stock bajo** (crítico)

#### 🛒 Pedidos
- `order.created` - Pedido creado
- `order.updated` - Pedido actualizado
- `order.completed` - Pedido completado
- `order.cancelled` - Pedido cancelado

#### 🏭 Producción
- `production.started` - Producción iniciada
- `production.completed` - Producción completada
- `production.cancelled` - Producción cancelada
- `production.delayed` - Producción retrasada

#### 👤 Clientes
- `client.created` - Cliente creado
- `client.updated` - Cliente actualizado
- `client.deleted` - Cliente eliminado

#### 🧾 Facturas
- `invoice.created` - Factura creada
- `invoice.paid` - Factura pagada
- `invoice.deleted` - Factura eliminada

## 🚀 Configuración

### Variables de Entorno

Crea o actualiza tu archivo `.env.local`:

```env
NEXT_PUBLIC_WS_URL=ws://localhost:8081/ws
```

### Estructura de Archivos

```
frontend/src/
├── components/
│   ├── NotificationCenter.tsx    # Componente visual de notificaciones
│   ├── WebSocketProvider.tsx     # Provider para inicializar WebSocket
│   └── WebSocketDebug.tsx        # Debug panel (solo desarrollo)
├── hooks/
│   └── useWebSocket.ts           # Hook personalizado para WebSocket
├── services/
│   └── websocket.ts              # Servicio de conexión WebSocket
├── store/
│   └── notifications.ts          # Store Zustand para notificaciones
└── types/
    └── index.ts                  # Tipos TypeScript

```

## 📖 Uso

### Básico - Ya está integrado automáticamente

El sistema se inicializa automáticamente al cargar la aplicación. Las notificaciones aparecerán en el header.

### Avanzado - Escuchar eventos específicos

```tsx
import { useWebSocket } from '@/hooks/useWebSocket';

function MiComponente() {
  const { subscribe } = useWebSocket();
  
  useEffect(() => {
    // Escuchar un evento específico
    const unsubscribe = subscribe('order.created', (data) => {
      console.log('Nuevo pedido:', data);
      // Tu lógica personalizada
    });
    
    return unsubscribe;
  }, [subscribe]);
}
```

### Agregar componente de debug (opcional)

En `app/layout.tsx`:

```tsx
import { WebSocketDebug } from '@/components/WebSocketDebug';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
          <WebSocketDebug /> {/* Solo visible en desarrollo */}
        </Providers>
      </body>
    </html>
  );
}
```

## 🧪 Pruebas

### 1. Verificar conexión

Abre la consola del navegador y deberías ver:
```
✅ WebSocket: Conectado y escuchando notificaciones
```

### 2. Enviar notificación de prueba desde PowerShell

```powershell
$notification = @{
    type = "order.created"
    payload = @{
        pedido_id = 123
        cliente = "Juan Pérez"
        total = 150.00
    }
    secret = "super_secret_key_123"
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:8081/notify" `
  -Method POST `
  -Body $notification `
  -ContentType "application/json"
```

### 3. Verificar en el frontend

- Verás un badge rojo en el icono de campana
- Al hacer clic, se abrirá el panel con la notificación
- La notificación mostrará: "🛒 Nuevo Pedido - Pedido #123 creado"

## 🎨 Personalización

### Cambiar colores de severidad

En `NotificationCenter.tsx`:

```tsx
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'error':
      return 'bg-red-50 border-red-200'; // Tus colores personalizados
    // ...
  }
};
```

### Agregar más información a las notificaciones

En `store/notifications.ts`, función `createNotificationFromEvent`:

```tsx
case 'order.created':
  title = '🛒 Nuevo Pedido';
  message = `Pedido #${payload.pedido_id} - Cliente: ${payload.cliente} - Total: $${payload.total}`;
  severity = 'success';
  break;
```

## 🐛 Troubleshooting

### WebSocket no conecta

1. Verifica que el servidor Go esté corriendo:
   ```powershell
   Test-NetConnection -ComputerName localhost -Port 8081
   ```

2. Verifica la variable de entorno:
   ```bash
   echo $env:NEXT_PUBLIC_WS_URL
   ```

3. Revisa la consola del navegador para errores

### Notificaciones no aparecen

1. Verifica que el evento esté en la lista de eventos válidos
2. Revisa que el formato del mensaje sea correcto:
   ```json
   {
     "type": "order.created",
     "payload": { ... }
   }
   ```

### Panel de notificaciones no se ve

- Limpia la caché del navegador
- Verifica que Tailwind CSS esté compilando correctamente
- Ejecuta: `npm run dev` para reiniciar el servidor de desarrollo

## 📚 Recursos

- [WebSocket API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Zustand - State Management](https://github.com/pmndrs/zustand)
- [Date-fns - Date Formatting](https://date-fns.org/)

## 🎯 Próximas Mejoras

- [ ] Sonido para notificaciones críticas
- [ ] Filtros por tipo de evento
- [ ] Persistencia en localStorage
- [ ] Notificaciones del navegador (Web Notifications API)
- [ ] Agrupación de notificaciones similares
- [ ] Búsqueda en notificaciones
- [ ] Exportar historial de notificaciones

---

**✨ Sistema listo para usar!** Las notificaciones en tiempo real ahora están completamente integradas en tu aplicación.
