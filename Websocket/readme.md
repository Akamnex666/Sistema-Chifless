# Servidor Websocket

## 📁 Estructura
```
websocket/
│
├── config/
│   └── config.go          # Carga variables de entorno (.env)
│
├── handlers/
│   ├── events_handler.go  # Endpoint HTTP /notify para recibir eventos del API REST
│   └── ws_handler.go      # Manejo de conexiones WebSocket entrantes (/ws)
│
├── hub/
│   ├── client.go          # Representa un cliente conectado
│   └── hub.go             # Administra las conexiones y broadcast
│
├── models/
│   └── events.go          # Definición de los tipos de eventos
│
├── .env                   # Variables de entorno del servidor WebSocket
├── go.sum
├── go.mod                 # Dependencias del módulo Go
├── main.go                # Punto de entrada del servidor
└── README.md              # (Este archivo)
```

---

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
cd Websocket
go mod tidy
```

### 2. Configurar variables de entorno
Crear archivo `.env` en la carpeta `Websocket/`:
```env
# Configuración del servidor WebSocket
PORT=8081

# Clave secreta compartida con la API REST
WS_SECRET=super_secret_key_123

# Origen permitido (frontend que se conectará por WebSocket)
ALLOWED_ORIGIN=http://localhost:3002
```

### 3. Levantar el servidor
```bash
go run .
```

✅ Deberías ver: `Servidor WebSocket corriendo en puerto 8081`

---

## ⚙️ Configuración del API-Rest

Para que la API REST pueda enviar notificaciones al WebSocket, agregar estas variables en `Api-Rest/.env`:

```env
# Configuración WebSocket Server
WS_URL=http://localhost:8081/notify
WS_SECRET=super_secret_key_123
```

> **Nota Docker**: Si el API REST corre en Docker, usar `WS_URL=http://host.docker.internal:8081/notify` o `http://172.17.0.1:8081/notify`

---

## 🔌 Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `ws://localhost:8081/ws` | WebSocket | Conexión para clientes (Frontend) |
| `http://localhost:8081/notify` | POST | Recibir eventos del API REST / AI Orchestrator |

---

## 🧪 Pruebas

### Probar conexión WebSocket
1. Instalar extensión "Simple WebSocket Client" en el navegador
2. Conectar a: `ws://localhost:8081/ws`
3. Deberías ver: "Cliente conectado" en la terminal del servidor

### Probar notificaciones
Usar Postman con el archivo `prueba-notificaciones.postman_collection.json`

**Ejemplo de petición manual:**
```bash
curl -X POST http://localhost:8081/notify \
  -H "Content-Type: application/json" \
  -H "X-WS-Secret: super_secret_key_123" \
  -d '{
    "type": "order.created",
    "payload": {
      "id": 1,
      "estado": "pendiente"
    }
  }'
```

---

## 📢 Tipos de Notificaciones

| Categoría | Eventos |
|-----------|---------|
| **Productos** | `product.created`, `product.updated`, `product.deleted`, `product.enabled`, `product.disabled` |
| **Insumos** | `supply.restocked`, `supply.updated`, `supply.deleted`, `supply.low` |
| **Pedidos** | `order.created`, `order.updated`, `order.completed`, `order.cancelled` |
| **Producción** | `production.started`, `production.completed`, `production.cancelled`, `production.delayed` |
| **Clientes** | `client.created`, `client.updated`, `client.deleted` |
| **Facturas** | `invoice.created`, `invoice.paid`, `invoice.deleted` |
| **AI Orchestrator** | `order.created.ai`, `ai.tool.executed`, `ai.analysis.completed` |

---

## 🐳 Requisitos para Producción

1. API REST y contenedor Docker corriendo
2. Verificar `docker-compose.yml` en la carpeta Api-Rest
3. Levantar contenedores: `docker compose up --build`
4. Ejecutar WebSocket en otra terminal: `go run .`

---

## 🔧 Troubleshooting

| Problema | Solución |
|----------|----------|
| Puerto 8081 en uso | Cambiar `PORT` en `.env` |
| No llegan notificaciones | Verificar `WS_SECRET` coincida en API REST |
| Error de CORS | Agregar tu dominio en `ALLOWED_ORIGIN` |
| Docker no conecta | Usar `host.docker.internal` o IP del host |