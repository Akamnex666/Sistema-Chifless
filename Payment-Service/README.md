# Payment Service

Microservicio de procesamiento de pagos con soporte de webhooks bidireccionales, múltiples proveedores y autenticación HMAC-SHA256.

## Lo que hemos implementado (Tareas 1-11)

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

## Flujo de un pago confirmado

```
1. Cliente → API-Rest: crear pedido
2. API-Rest → Payment-Service: crear pago (POST /payments/create)
3. Payment-Service: confirmar pago (POST /payments/confirm)
4. Webhook Dispatcher: busca partners suscritos a "payment.confirmed"
5. Para cada partner:
   - Firma payload con HMAC del partner
   - Envía POST a webhook_url del partner
   - Si falla: reintentos con exponential backoff
6. Partner recibe webhook en POST /webhooks/receive
7. Verifica HMAC con su secret
8. Procesa evento y retorna ACK
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

## Variables de entorno

```env
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=admin123
DATABASE_NAME=sistema-chifles

JWT_SECRET=supersecreto123
JWT_EXPIRES_IN=1h

PAYMENT_SERVICE_PORT=3002
```

## Estructura de carpetas

```
src/
├── payments/          # CRUD de pagos y confirmación
├── partners/          # Registro y gestión de partners
├── webhooks/          # Dispatcher y receiver de webhooks
├── providers/         # Interfaces de proveedores de pago
├── adapters/          # Implementaciones (Mock, Stripe)
├── models/            # Entidades TypeORM (Payment, Partner, WebhookDispatch)
├── utils/             # HMAC-SHA256, retry logic, logger
└── app.module.ts      # Módulo raíz
```

## Documentación adicional

- [PARTNER_ENDPOINTS.md](PARTNER_ENDPOINTS.md) - API de partners
- [WEBHOOK_RECEIVER_DOCS.md](WEBHOOK_RECEIVER_DOCS.md) - Cómo recibir webhooks
- [ENDPOINTS.md](ENDPOINTS.md) - Todos los endpoints disponibles

## Próximas tareas (12-24)

- Integración WebSocket para notificaciones en tiempo real
- n8n workflows para orquestación de eventos
- Documentación de integración con partners
- Testing e2e bidireccional
