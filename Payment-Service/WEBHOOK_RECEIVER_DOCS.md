# Webhook Receiver - API Documentation

## POST /webhooks/receive

**Descripción:** Endpoint para recibir webhooks de partners externos con validación HMAC.

**Headers requeridos:**

```
X-Partner-Id: {partnerId}           # UUID del partner
X-Webhook-Signature: {hmac_signature}  # HMAC-SHA256 del payload
```

**Request Body:**

```json
{
  "event_type": "order.created",
  "transaction_id": "txn_123456",
  "payload": {
    "orderId": "123",
    "amount": 100.50,
    "status": "completed",
    "customData": {...}
  }
}
```

**Ejemplo cURL:**

```bash
# Primero, obtener el partner secret
# (El partner lo recibe al registrarse en POST /partners/register)

PARTNER_ID="1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p"
PARTNER_SECRET="abc123def456..."  # 64 caracteres hexadecimales

PAYLOAD='{
  "orderId": "123",
  "amount": 100.50,
  "status": "completed"
}'

# Generar firma HMAC-SHA256
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$PARTNER_SECRET" -hex | cut -d' ' -f2)

# Enviar webhook
curl -X POST http://localhost:3002/webhooks/receive \
  -H "Content-Type: application/json" \
  -H "X-Partner-Id: $PARTNER_ID" \
  -H "X-Webhook-Signature: $SIGNATURE" \
  -d '{
    "event_type": "order.created",
    "payload": '"$PAYLOAD"',
    "signature": "'"$SIGNATURE"'"
  }'
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Webhook order.created received and processed",
  "received_at": "2026-01-18T10:30:00.000Z",
  "event_id": "evt_1705577400000_abc123xyz"
}
```

**Error Responses:**

**400 Bad Request** - Payload inválido:

```json
{
  "success": false,
  "error": "event_type is required and must be a string",
  "code": "INVALID_PAYLOAD",
  "timestamp": "2026-01-18T10:30:00.000Z"
}
```

**401 Unauthorized** - Firma inválida o partner no encontrado:

```json
{
  "success": false,
  "error": "Webhook signature verification failed",
  "code": "SIGNATURE_VERIFICATION_FAILED",
  "timestamp": "2026-01-18T10:30:00.000Z"
}
```

---

## POST /webhooks/receive-body

**Descripción:** Alternativa que permite enviar el partner_id y signature en el body en lugar de headers.

**Request Body:**

```json
{
  "partner_id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
  "event_type": "order.created",
  "payload": {...},
  "signature": "abc123..."
}
```

**Ejemplo cURL:**

```bash
curl -X POST http://localhost:3002/webhooks/receive-body \
  -H "Content-Type: application/json" \
  -d '{
    "partner_id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    "event_type": "order.created",
    "payload": {
      "orderId": "123",
      "amount": 100.50
    },
    "signature": "abc123def456..."
  }'
```

---

## Event Types Soportados

| Event Type            | Descripción            | Payload Example                          |
| --------------------- | ---------------------- | ---------------------------------------- |
| `order.created`       | Nuevo pedido creado    | `{ orderId, customerId, amount, items }` |
| `order.updated`       | Pedido actualizado     | `{ orderId, status, updatedAt }`         |
| `order.completed`     | Pedido completado      | `{ orderId, completedAt }`               |
| `inventory.updated`   | Inventario actualizado | `{ productId, quantity, warehouse }`     |
| `customer.registered` | Cliente registrado     | `{ customerId, email, name }`            |

**Extensible:** Se pueden agregar nuevos event types sin cambiar el endpoint.

---

## Flujo de Validación

```
1. Verificar headers requeridos (X-Partner-Id, X-Webhook-Signature)
   ↓
2. Obtener secret del partner desde DB
   ↓
3. Recalcular HMAC-SHA256 del payload con el secret
   ↓
4. Comparar con firma recibida (timing-safe comparison)
   ↓
5. Validar estructura del evento (event_type, payload, signature)
   ↓
6. Procesar según event_type
   ↓
7. Retornar ACK con event_id único
```

---

## Seguridad

- ✅ **HMAC-SHA256** para autenticación (no repudiation)
- ✅ **Timing-safe comparison** para prevenir timing attacks
- ✅ **Partner validation** - solo partners registrados pueden enviar
- ✅ **Event validation** - estructura obligatoria
- ✅ **Logging completo** - track de todos los eventos para auditoría

---

## Ejemplos de Integración

### Node.js/TypeScript

```typescript
import crypto from "crypto";

const partnerId = "partner-uuid";
const partnerSecret = "secret-hex-string";

const payload = {
  orderId: "123",
  amount: 100.5,
  status: "completed",
};

// Generar firma
const signature = crypto
  .createHmac("sha256", partnerSecret)
  .update(JSON.stringify(payload))
  .digest("hex");

// Enviar webhook
await fetch("http://localhost:3002/webhooks/receive", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Partner-Id": partnerId,
    "X-Webhook-Signature": signature,
  },
  body: JSON.stringify({
    event_type: "order.created",
    payload,
    signature,
  }),
});
```

### Python

```python
import hashlib
import hmac
import json
import requests

partner_id = 'partner-uuid'
partner_secret = 'secret-hex-string'

payload = {
    'orderId': '123',
    'amount': 100.50,
    'status': 'completed',
}

# Generar firma
payload_json = json.dumps(payload)
signature = hmac.new(
    partner_secret.encode(),
    payload_json.encode(),
    hashlib.sha256
).hexdigest()

# Enviar webhook
response = requests.post(
    'http://localhost:3002/webhooks/receive',
    headers={
        'X-Partner-Id': partner_id,
        'X-Webhook-Signature': signature,
    },
    json={
        'event_type': 'order.created',
        'payload': payload,
        'signature': signature,
    }
)
```
