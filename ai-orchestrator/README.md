# 🤖 AI Orchestrator - Asistente Inteligente para Sistema Chifless

## ¿Qué es esto?

El **AI Orchestrator** es el cerebro inteligente del Sistema Chifless. Es un servicio que permite a los usuarios interactuar con el sistema de gestión de pedidos de chifles usando lenguaje natural, como si estuvieran hablando con una persona.

En lugar de navegar por menús o llenar formularios, puedes simplemente escribir cosas como:
- *"¿Qué productos tienen disponibles?"*
- *"Quiero hacer un pedido de 10 bolsas de chifles de sal"*
- *"¿Cómo va mi pedido #123?"*
- *"Muéstrame las ventas de esta semana"*

---

## 🎯 ¿Cómo funciona? (Explicación simple)

Imagina que tienes un asistente muy inteligente que puede:
1. **Entender lo que escribes** - Usa inteligencia artificial para comprender tus mensajes
2. **Decidir qué hacer** - Determina si necesita consultar productos, crear pedidos, etc.
3. **Ejecutar acciones** - Se conecta con el sistema real para hacer las cosas
4. **Responderte** - Te explica qué hizo y qué encontró

### El flujo es así:

```
Usuario escribe: "Quiero ver los productos disponibles"
         ↓
    [AI Orchestrator]
         ↓
    El LLM (IA) entiende que quieres ver productos
         ↓
    Decide usar la herramienta "consultar_productos"
         ↓
    Llama al API Rest para obtener los productos
         ↓
    Recibe los datos y los formatea bonito
         ↓
Usuario recibe: "Tenemos estos productos: Chifles de Sal ($5)..."
```

---

## 🧩 Los 3 Componentes Principales

### 1. 💬 Módulo de Chat (`/src/chat/`)

Este es el **punto de entrada**. Aquí llegan todos los mensajes de los usuarios.

**¿Qué hace?**
- Recibe los mensajes a través del endpoint `/api/chat/message`
- Mantiene el historial de conversación por sesión (recuerda lo que hablaste antes)
- Coordina todo el proceso de respuesta
- Guarda logs de todas las interacciones para auditoría

**Endpoints disponibles:**
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/chat/message` | Enviar un mensaje al asistente |
| GET | `/api/chat/session/:id/history` | Ver el historial de una conversación |
| DELETE | `/api/chat/session/:id` | Limpiar una conversación |
| GET | `/api/chat/models` | Ver modelos de IA disponibles |
| PUT | `/api/chat/provider` | Cambiar el proveedor de IA |
| GET | `/api/chat/logs` | Ver logs de interacciones |

---

### 2. 🧠 Módulo LLM (`/src/llm/`)

Este es el **cerebro**. Aquí es donde vive la inteligencia artificial.

**¿Qué hace?**
- Se conecta con diferentes proveedores de IA (puedes elegir cuál usar)
- Envía los mensajes al modelo de IA elegido
- Recibe las respuestas y detecta si la IA quiere usar herramientas
- Maneja errores y límites de uso de las APIs

**Proveedores disponibles:**

| Proveedor | Modelo por defecto | Notas |
|-----------|-------------------|-------|
| 🟢 **Groq** | llama-3.3-70b-versatile | ¡GRATIS! Muy rápido |
| 🔵 **Google Gemini** | gemini-2.0-flash | Muy capaz, soporta imágenes |
| ⚫ **xAI Grok** | grok-2-latest | Modelo de X/Twitter |
| 🟡 **OpenAI** | gpt-4o-mini | El clásico ChatGPT |

**¿Cómo cambiar de proveedor?**

Puedes cambiar en cualquier momento enviando:
```bash
PUT /api/chat/provider
{ "provider": "gemini" }  # o "groq", "grok", "openai"
```

---

### 3. 🛠️ Módulo MCP Tools (`/src/mcp/`)

Estas son las **manos** del asistente. Las herramientas que puede usar para hacer cosas reales.

**¿Qué hace?**
- Define las acciones que el asistente puede realizar
- Ejecuta las llamadas a la API Rest del sistema
- Envía notificaciones por WebSocket cuando crea pedidos

**Herramientas disponibles:**

| Herramienta | Descripción | Ejemplo de uso |
|-------------|-------------|----------------|
| `consultar_productos` | Ve todos los productos y precios | "¿Qué chifles tienen?" |
| `estado_pedido` | Consulta el estado de un pedido | "¿Cómo va mi pedido #15?" |
| `crear_pedido` | Crea un nuevo pedido | "Quiero 5 bolsas de chifles de sal" |
| `registrar_cliente` | Registra un cliente nuevo | "Registrarme como cliente nuevo" |
| `analisis_ventas` | Genera reportes de ventas | "¿Cuánto vendimos esta semana?" |

---

## 🔄 El Ciclo Completo de una Conversación

Cuando envías un mensaje, pasan estas cosas:

```
1. 📨 Tu mensaje llega al ChatController

2. 💾 Se guarda en el historial de sesión

3. 🧠 Se envía al LLM (IA) junto con:
   - Tu mensaje
   - El historial previo
   - Las herramientas disponibles
   - Imágenes (si enviaste alguna)

4. 🤔 El LLM analiza y decide:
   - Si puede responder directo → Responde
   - Si necesita datos → Pide usar una herramienta

5. 🛠️ Si pidió herramientas:
   - Se ejecuta la herramienta (ej: consultar productos)
   - Se obtienen los datos del API Rest
   - Se envían los resultados al LLM

6. 📝 El LLM genera la respuesta final con los datos

7. 📤 Se te envía la respuesta
```

**Este ciclo de herramientas puede repetirse hasta 5 veces** si el asistente necesita usar varias herramientas para responder tu pregunta.

---

## ⚙️ Configuración

### Variables de Entorno (.env)

```env
# Puerto del servicio
PORT=3003

# Proveedor por defecto: 'gemini', 'grok', 'openai' o 'groq'
DEFAULT_LLM_PROVIDER=groq

# APIs de los proveedores (necesitas al menos una)
GROQ_API_KEY=tu-api-key-de-groq
GEMINI_API_KEY=tu-api-key-de-gemini
GROK_API_KEY=tu-api-key-de-grok
OPENAI_API_KEY=tu-api-key-de-openai

# Conexión con otros servicios
API_REST_URL=http://localhost:3000      # API Rest de NestJS
WEBSOCKET_URL=http://localhost:8080      # Servidor WebSocket de Go
```

### ¿Dónde obtener las API Keys?

| Proveedor | URL | Costo |
|-----------|-----|-------|
| Groq | https://console.groq.com/keys | Gratis |
| Gemini | https://aistudio.google.com/app/apikey | Gratis (con límites) |
| Grok | https://console.x.ai/ | De pago |
| OpenAI | https://platform.openai.com/api-keys | De pago |

---

## 🚀 Cómo Ejecutar

### Desarrollo
```bash
cd ai-orchestrator
npm install
npm run start:dev
```

### Producción
```bash
npm run build
npm run start:prod
```

El servicio estará disponible en `http://localhost:3003`

---

## 📡 Ejemplo de Uso con la API

### Enviar un mensaje simple
```bash
POST http://localhost:3003/api/chat/message
Content-Type: application/json

{
  "text": "¿Qué productos tienen disponibles?",
  "sessionId": "mi-sesion-123"
}
```

### Respuesta
```json
{
  "text": "¡Hola! Tenemos estos productos disponibles:\n\n1. **Chifles de Sal** - $5.00\n2. **Chifles de Limón** - $5.50\n...",
  "toolsUsed": ["consultar_productos"],
  "sessionId": "mi-sesion-123",
  "timestamp": "2026-01-19T10:30:00.000Z",
  "model": "llama-3.3-70b-versatile",
  "provider": "Groq"
}
```

### Enviar mensaje con imagen
```bash
POST http://localhost:3003/api/chat/message
Content-Type: application/json

{
  "text": "¿Puedes identificar los productos en esta imagen?",
  "image": "data:image/jpeg;base64,/9j/4AAQ...",
  "sessionId": "mi-sesion-123"
}
```

---

## 🏗️ Arquitectura del Proyecto

```
ai-orchestrator/
├── src/
│   ├── main.ts                 # Punto de entrada de la aplicación
│   ├── app.module.ts           # Módulo raíz que une todo
│   │
│   ├── chat/                   # 💬 Módulo de Chat
│   │   ├── chat.controller.ts  # Endpoints HTTP
│   │   ├── chat.service.ts     # Lógica de procesamiento
│   │   ├── dto/                # Validación de datos de entrada
│   │   └── interfaces/         # Tipos e interfaces
│   │
│   ├── llm/                    # 🧠 Módulo de IA
│   │   ├── llm.service.ts      # Orquestador de proveedores
│   │   ├── llm.module.ts       # Configuración del módulo
│   │   ├── providers/          # Implementaciones de cada IA
│   │   │   ├── gemini.provider.ts
│   │   │   ├── grok.provider.ts
│   │   │   ├── openai.provider.ts
│   │   │   └── groq.provider.ts
│   │   └── interfaces/         # Tipos compartidos
│   │
│   └── mcp/                    # 🛠️ Módulo de Herramientas
│       ├── mcp-tools.service.ts  # Ejecutor de herramientas
│       ├── mcp.module.ts         # Configuración del módulo
│       └── tools/
│           └── tool-definitions.ts  # Definición de herramientas
│
├── .env                        # Variables de entorno
├── package.json                # Dependencias
└── tsconfig.json               # Configuración TypeScript
```

---

## 🔌 Integración con Otros Servicios

El AI Orchestrator se conecta con:

1. **API Rest (NestJS)** - Puerto 3000
   - Para consultar/crear productos, pedidos, clientes
   - Todas las operaciones CRUD del sistema

2. **WebSocket Server (Go)** - Puerto 8080
   - Para enviar notificaciones en tiempo real
   - Cuando se crea un pedido, notifica al frontend

3. **Frontend (Next.js)** - Puerto 3002
   - El chat del frontend se comunica con este servicio
   - CORS configurado para permitir conexiones

---

## 🎓 Resumen para Entender Rápido

1. **Es un chatbot inteligente** que entiende español y puede hacer acciones reales
2. **Usa IA de verdad** (Groq, Gemini, GPT, etc.) para entender lo que escribes
3. **Tiene herramientas** para consultar productos, crear pedidos, ver reportes
4. **Mantiene contexto** - recuerda lo que hablaste en la sesión
5. **Se integra** con el API Rest y el WebSocket del sistema
6. **Es configurable** - puedes cambiar de IA en cualquier momento

---

## 📚 Tecnologías Usadas

- **NestJS** - Framework de Node.js para el backend
- **TypeScript** - JavaScript con tipos para mayor seguridad
- **@google/generative-ai** - SDK de Google Gemini
- **Axios** - Cliente HTTP para llamadas a APIs externas
- **class-validator** - Validación de datos de entrada
- **uuid** - Generación de IDs únicos para sesiones

---

## 🐛 Solución de Problemas Comunes

### "Error: GEMINI_API_KEY no está configurada"
➡️ Agrega tu API key en el archivo `.env`

### "Cuota de API excedida"
➡️ El servicio maneja esto automáticamente y te avisa. Espera unos segundos o cambia de proveedor.

### "Herramienta desconocida"
➡️ El LLM intentó usar una herramienta que no existe. Esto no debería pasar, pero si pasa, revisa los logs.

### "Error al consultar productos"
➡️ Verifica que el API Rest esté corriendo en el puerto 3000

---

¡Listo! Ahora entiendes cómo funciona el AI Orchestrator. Si tienes dudas, simplemente pregúntale al asistente 😄
