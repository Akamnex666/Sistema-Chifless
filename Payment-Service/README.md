# Payment Service

Microservicio de procesamiento de pagos con soporte de webhooks bidireccionales, múltiples proveedores y autenticación HMAC-SHA256.

## Lo que hemos implementado (Tareas 1-12 completadas)

### 1. Base del servicio (Tareas 1-2)

**Archivos:** `src/app.module.ts`, `src/main.ts`, `package.json`

- Estructura NestJS con TypeORM integrado
- Configuración de base de datos PostgreSQL
- Endpoints base de salud del servicio

### 2. Procesamiento de pagos (Tareas 3-5)

**Archivos:** `src/payments/`, `src/providers/payment.provider.ts`, `src/adapters/`

- **payment.provider.ts**: Interface abstracta que define cómo procesar pagos
- **mock-payment.adapter.ts**: Simulador de pagos sin API real
- **payment.entity.ts**: Tabla de pagos en BD
- **payment.controller.ts**: Endpoints REST:
  - `POST /payments/create` - Crear pago
  - `POST /payments/confirm` - Confirmar pago
  - `GET /payments/:id` - Obtener pago
  - `GET /payments/transaction/:id` - Buscar por transaction ID

### 3. Gestión de partners (Tareas 7-8)

**Archivos:** `src/partners/`

- **partner.entity.ts**: Tabla de partners con webhook_url y hmac_secret
- **partner.controller.ts**:
  - `POST /partners/register` - Registra partner y genera secret HMAC automáticamente
  - `GET /partners` - Lista partners activos
  - `GET /partners/:id` - Obtiene details de partner
- **partner.service.ts**: Lógica de registro y búsqueda de partners

### 4. Seguridad con HMAC (Tarea 9)

**Archivos:** `src/utils/hmac.utils.ts` (24 tests passing)

- `generateSignature()` - Firma payloads con HMAC-SHA256
- `verifySignature()` - Valida firmas (timing-safe contra ataques de timing)
- `generateSecret()` - Genera secretos aleatorios hexadecimales (64 caracteres)
- Protección contra timing attacks y verificación segura

### 5. Envío de webhooks a partners (Tarea 10)

**Archivos:** `src/webhooks/webhook-dispatcher.service.ts`, `src/models/webhook-dispatch.entity.ts`

- **webhook-dispatcher.service.ts**:
  - `dispatchEvent()` - Busca partners suscritos y envía webhooks
  - `sendDispatch()` - Envía webhook firmado con HMAC del partner
  - Reintentos automáticos con exponential backoff (1s → 2s → 4s, max 30s)
  - Max 3 intentos antes de marcar como fallido
- **webhook-dispatch.entity.ts**: Registra cada intento de envío
- Se dispara automáticamente al confirmar un pago

### 6. Recepción de webhooks desde partners (Tarea 11)

**Archivos:** `src/webhooks/webhook-receiver.service.ts`, `src/webhooks/webhook-receiver.controller.ts`

- **webhook-receiver.controller.ts**:
  - `POST /webhooks/receive` - Recibe webhooks con firma en headers
  - `POST /webhooks/receive-body` - Alternativa con firma en body
- **webhook-receiver.service.ts**:
  - Verifica HMAC con timing-safe comparison
  - Valida estructura del evento
  - Procesa eventos: order.created, order.updated, order.completed, inventory.updated, customer.registered
  - Genera event_id único para auditoría
- Retorna ACK con confirmación de recepción

### 7. Normalización de eventos de pago (Tarea 6)

**Archivos:** `src/models/payment-event.model.ts`

- **PaymentEvent class**: Abstrae diferencias entre proveedores (Mock, Stripe)
- `fromMockAdapter()` - Convierte respuesta Mock a PaymentEvent
- `fromStripeEvent()` - Convierte evento Stripe a PaymentEvent
- Tipos: payment.created, payment.confirmed, payment.failed, payment.refunded
- `toJSON()` - Serializa para webhooks

### 8. WebSocket para notificaciones (Tarea 12)

**Archivos:** `src/websockets/payment.gateway.ts`, `src/websockets/websocket.module.ts`

- **PaymentGateway**: Socket.io gateway en namespace `/payments`
- `notifyPaymentConfirmed()` - Emite pago confirmado
- `notifyPaymentFailed()` - Emite pago fallido
- `notifyWebhookDispatched()` - Emite envío a partner
- `notifyWebhookReceived()` - Emite evento recibido de partner
- `notifyStatusUpdate()` - Notificaciones genéricas
- Eventos broadcast a todos los clientes conectados

### 9. Guía de integración con partners (Tarea 13)

**Archivos:** `PARTNER_INTEGRATION.md`

- Guía completa de registro de partners
- Documentación de todos los eventos disponibles
- Ejemplos de verificación HMAC en Node.js y Python
- Configuración de reintentos automáticos
- Mejores prácticas de seguridad
- Ejemplo completo de integración

### 10. Testing de webhooks bidireccionales (Tarea 14)

**Archivos:** `TESTING_WEBHOOKS.md`

- Setup con ngrok para tunel local
- Script Node.js con 5 test suites
- Pruebas de flujo de pago completo
- Validación de HMAC
- Testing de reintentos
- Comandos cURL para pruebas manuales

### 11. Configuración de entorno (Tarea 22)

**Archivos:** `.env.example`

- Variables de BD PostgreSQL
- Configuración de proveedores de pago
- Credenciales Stripe (opcional)
- Configuración de webhooks (timeout, reintentos, exponential backoff)
- JWT y seguridad
- Logging y monitoring
- URLs de servicios externos

## Flujo de un pago confirmado

```
1. Cliente → API-Rest: crear pedido
2. API-Rest → Payment-Service: crear pago (POST /payments/create)
3. Payment-Service: confirmar pago (POST /payments/confirm)
4. PaymentEvent normaliza el evento (payment.confirmed)
5. Webhook Dispatcher: busca partners suscritos a "payment.confirmed"
6. Para cada partner:
   - Firma payload con HMAC del partner
   - Envía POST a webhook_url del partner
   - Si falla: reintentos con exponential backoff (1s, 2s, 4s)
7. PaymentGateway emite evento WebSocket a clientes conectados
8. Partner recibe webhook en POST /webhooks/receive
9. Verifica HMAC con su secret
10. Procesa evento y retorna ACK
11. Payment Service recibe ACK y marca webhook como SUCCESS
```

## Instalación

```bash
npm install
```

## Ejecutar

Desarrollo:

```bash
npm run start:dev
```

Producción:

```bash
npm run start:prod
```

## Tests

```bash
npm test                    # Todos los tests
npm run test:cov           # Con cobertura
```

## Configuración de entorno

Ver `.env.example` para todas las variables disponibles.

Variables mínimas requeridas:

```env
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=admin123
DATABASE_NAME=sistema-chifles

JWT_SECRET=supersecreto123
JWT_EXPIRES_IN=1h

PAYMENT_SERVICE_PORT=3002
PAYMENT_PROVIDER=mock

NODE_ENV=development
```

## Estructura de carpetas

```
src/
├── payments/          # CRUD de pagos y confirmación
├── partners/          # Registro y gestión de partners
├── webhooks/          # Dispatcher y receiver de webhooks
├── websockets/        # Gateway de Socket.io para notificaciones
├── providers/         # Interfaces de proveedores de pago
├── adapters/          # Implementaciones (Mock, Stripe)
├── models/            # Entidades TypeORM (Payment, Partner, WebhookDispatch, PaymentEvent)
├── utils/             # HMAC-SHA256, retry logic, logger
└── app.module.ts      # Módulo raíz
```

## Documentación adicional

- [PARTNER_INTEGRATION.md](PARTNER_INTEGRATION.md) - Guía completa de integración
- [TESTING_WEBHOOKS.md](TESTING_WEBHOOKS.md) - Tests bidireccionales locales
- [WEBHOOK_RECEIVER_DOCS.md](WEBHOOK_RECEIVER_DOCS.md) - API de webhooks entrantes
- [.env.example](.env.example) - Variables de entorno completas

## Próximas tareas (13-24)

**Código NestJS:**

- Task 4: StripeAdapter (opcional)
- Task 23: Integración final (Payment → Api-Rest → WebSocket)
- Task 24: Testing e2e y bugfixes

**n8n (workflow visual):**

- Task 15: Setup n8n con Docker
- Task 16: Payment Handler workflow
- Task 17: Partner Handler workflow
- Task 18: Scheduled Task workflow

**Documentación:**

- Task 19: Exportar workflows n8n
- Task 20: README final
- Task 21: Integración con otros servicios

## Endpoints Disponibles

**Pagos:**

- `POST /payments/create` - Crear pago
- `POST /payments/confirm` - Confirmar pago
- `GET /payments/:id` - Obtener pago
- `GET /payments/transaction/:id` - Buscar por transaction ID

**Partners:**

- `POST /partners/register` - Registrar partner
- `GET /partners` - Listar partners
- `GET /partners/:id` - Obtener partner

**Webhooks:**

- `POST /webhooks/receive` - Recibir webhook (con headers)
- `POST /webhooks/receive-body` - Recibir webhook (con body)

**WebSocket:**

- Namespace: `/payments`
- Eventos: `payment.confirmed`, `payment.failed`, `webhook.dispatched`, `webhook.received`, `status.update`
