# 🚀 Guía de Inicialización - Sistema Chifles

Esta guía describe paso a paso cómo encender todos los servicios del proyecto.

## 📋 Requisitos Previos

- **Node.js** v18+ (para Api-Rest, Auth-Service, AI-Orchestrator, Frontend)
- **Python** 3.10+ (para GraphQL)
- **Go** 1.21+ (para WebSocket)
- **PostgreSQL** corriendo en puerto 5433
- **Docker** (opcional, para PostgreSQL)

---

## 🗄️ Base de Datos (PostgreSQL)

### Opción 1: Docker (Recomendado)
```bash
cd Api-Rest
docker-compose up -d
```

### Opción 2: PostgreSQL Local
Asegúrate de tener PostgreSQL corriendo en:
- **Host:** localhost
- **Puerto:** 5433
- **Usuario:** name
- **Contraseña:** password
- **Base de datos:** chifles

---

## 1️⃣ Api-Rest (NestJS) - Puerto 3000

### ¿Qué hace?
API REST principal que maneja todas las operaciones CRUD:
- Clientes, Productos, Insumos
- Pedidos, Facturas
- Órdenes de Producción
- Autenticación JWT (validación de tokens)

### Variables de Entorno (.env)
```env
# Base de datos
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5433
DB_USER=name
DB_PASSWORD=pass
DB_NAME=chifles

# JWT - DEBE COINCIDIR con Auth-Service
JWT_SECRET=chifles_super_secret_jwt_key_2024

# WebSocket para notificaciones
WS_URL=http://localhost:8081/notify
WS_SECRET=super_secret_key_123

# Puerto
PORT=3000
```

### Comandos
```bash
cd Api-Rest
npm install          # Solo la primera vez
npm run start:dev    # Modo desarrollo con hot-reload
```

### Verificar
- Swagger: http://localhost:3000/api
- Health: http://localhost:3000/chifles/auth/health

---

## 2️⃣ Auth-Service (NestJS) - Puerto 3001

### ¿Qué hace?
Microservicio de autenticación que maneja:
- Registro de usuarios
- Login (genera tokens JWT)
- Refresh de tokens
- Validación de sesiones

### Variables de Entorno (.env)
```env
# Base de datos
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=zhali
DB_PASSWORD=Holaquehace
DB_DATABASE=chifles

# JWT - DEBE COINCIDIR con Api-Rest
JWT_SECRET=chifles_super_secret_jwt_key_2024
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=chifles_refresh_secret_key_2024
JWT_REFRESH_EXPIRES_IN=7d

# Puerto
PORT=3001
```

### Comandos
```bash
cd Auth-Service
npm install          # Solo la primera vez
npm run start:dev    # Modo desarrollo
```

### Verificar
- Swagger: http://localhost:3001/docs
- Endpoints disponibles:
  - POST `/api/auth/register` - Registrar usuario
  - POST `/api/auth/login` - Iniciar sesión
  - POST `/api/auth/refresh` - Renovar token
  - GET `/api/auth/me` - Datos del usuario actual

---

## 3️⃣ WebSocket Server (Go) - Puerto 8081

### ¿Qué hace?
Servidor de notificaciones en tiempo real:
- Envía actualizaciones cuando se crean/modifican pedidos
- Notifica cambios en órdenes de producción
- Conexión persistente con el frontend

### Variables de Entorno (.env)
```env
PORT=8081
WS_SECRET=super_secret_key_123
ALLOWED_ORIGIN=http://localhost:7171
```

### Comandos
```bash
cd Websocket
go mod tidy          # Descargar dependencias
go run main.go       # Iniciar servidor
```

### Verificar
- WebSocket: ws://localhost:8081/ws
- El frontend se conecta automáticamente

---

## 4️⃣ GraphQL Server (Python/FastAPI) - Puerto 8001

### ¿Qué hace?
Servicio de reportes y consultas complejas:
- Reportes de ventas
- Reportes de producción
- Reportes de inventario
- Consultas agregadas

### Variables de Entorno (.env)
```env
# URLs de servicios
API_URL=http://127.0.0.1:3000/chifles
AUTH_SERVICE_URL=http://127.0.0.1:3001/api

# Puerto (usar 8001, no 8000)
PORT=8001
DEBUG=true

# Credenciales para auto-login (opcional)
API_LOGIN_EMAIL=admin@chifles.com
API_LOGIN_PASSWORD=Admin123!

# O usar token directo (opcional)
API_TOKEN=

# Origen del frontend para CORS
FRONTEND_ORIGIN=http://localhost:7171
```

### Comandos
```bash
cd GraphQL
python -m venv .venv                    # Solo la primera vez
.venv\Scripts\Activate.ps1              # Windows PowerShell
# o: source .venv/bin/activate          # Linux/Mac/Git Bash
pip install -r requirements.txt         # Solo la primera vez
uvicorn app.main:app --reload --port 8001
```

### Verificar
- GraphiQL: http://localhost:8001/graphql
- Health: http://localhost:8001/health

---

## 5️⃣ AI Orchestrator (NestJS) - Puerto 3003

### ¿Qué hace?
Orquestador de inteligencia artificial:
- Chatbot integrado
- Procesa consultas en lenguaje natural
- Conecta con múltiples proveedores de LLM (Groq, Gemini, OpenAI)

### Variables de Entorno (.env)
```env
# Puerto del servicio
PORT=3003

# URL del Frontend (para CORS)
FRONTEND_URL=http://localhost:7171

# Proveedor por defecto: 'gemini', 'grok', 'openai' o 'groq'
DEFAULT_LLM_PROVIDER=groq

# Groq API (GRATIS - Recomendado)
# Obtén tu API Key en: https://console.groq.com/keys
GROQ_API_KEY=tu_api_key_aqui
GROQ_MODEL=llama-3.3-70b-versatile

# Google Gemini API (alternativa)
# Obtén tu API Key en: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=tu_api_key_aqui
GEMINI_MODEL=gemini-2.0-flash

# OpenAI API (opcional)
OPENAI_API_KEY=tu_api_key_aqui
OPENAI_MODEL=gpt-4o-mini
```

### Comandos
```bash
cd ai-orchestrator
npm install          # Solo la primera vez
npm run start:dev    # Modo desarrollo
```

### Verificar
- API: http://localhost:3003/api
- El chatbot del frontend se conecta aquí

---

## 6️⃣ Frontend (Next.js) - Puerto 7171

### ¿Qué hace?
Interfaz de usuario completa:
- Dashboard con estadísticas
- Gestión de clientes, productos, insumos
- Gestión de pedidos y facturación
- Reportes con gráficos
- Chatbot de IA flotante
- Notificaciones en tiempo real

### Variables de Entorno (.env.local)
```env
# URL del API REST (NestJS)
NEXT_PUBLIC_API_REST_URL=http://localhost:3000/chifles

# URL del Auth Service
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001/api

# URL del servicio GraphQL
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8001/graphql

# URL del WebSocket
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8081/ws

# URL del AI Orchestrator
NEXT_PUBLIC_AI_ORCHESTRATOR_URL=http://localhost:3003/api
```

### Comandos
```bash
cd frontend
npm install          # Solo la primera vez
npm run dev          # Modo desarrollo (puerto 7171)
```

### Verificar
- Frontend: http://localhost:7171
- Login: http://localhost:7171/login
- Dashboard: http://localhost:7171/dashboard

---

## 📊 Orden de Inicio Recomendado

```
1. PostgreSQL (Docker o local)
2. Api-Rest (puerto 3000)
3. Auth-Service (puerto 3001)
4. WebSocket (puerto 8081)
5. GraphQL (puerto 8001)
6. AI-Orchestrator (puerto 3003)
7. Frontend (puerto 7171)
```

### Script de Inicio Rápido (PowerShell)

Puedes abrir múltiples terminales y ejecutar en orden:

```powershell
# Terminal 1 - Api-Rest
cd Api-Rest; npm run start:dev

# Terminal 2 - Auth-Service
cd Auth-Service; npm run start:dev

# Terminal 3 - WebSocket
cd Websocket; go run main.go

# Terminal 4 - GraphQL
cd GraphQL; .venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --port 8001

# Terminal 5 - AI Orchestrator
cd ai-orchestrator; npm run start:dev

# Terminal 6 - Frontend
cd frontend; npm run dev
```

---

## 🔐 Crear Usuario Inicial

1. Abre http://localhost:7171/register
2. Registra un usuario con:
   - Email: `admin@chifles.com`
   - Contraseña: `Admin123!`
   - Nombre: `Administrador`
3. Inicia sesión en http://localhost:7171/login

---

## 🔍 Puertos Resumen

| Servicio | Puerto | URL |
|----------|--------|-----|
| PostgreSQL | 5433 | localhost:5433 |
| Api-Rest | 3000 | http://localhost:3000 |
| Auth-Service | 3001 | http://localhost:3001 |
| WebSocket | 8081 | ws://localhost:8081/ws |
| GraphQL | 8001 | http://localhost:8001/graphql |
| AI Orchestrator | 3003 | http://localhost:3003/api |
| Frontend | 7171 | http://localhost:7171 |

---

## ⚠️ Problemas Comunes

### Error 401 Unauthorized
- Verifica que `JWT_SECRET` sea idéntico en Api-Rest y Auth-Service
- Cierra sesión e inicia sesión nuevamente
- Limpia localStorage: `localStorage.clear()` en consola del navegador

### GraphQL no carga reportes
- Verifica que el frontend envíe el token (F12 → Network → Headers)
- Asegúrate que el usuario esté logueado

### WebSocket no conecta
- Verifica que `ALLOWED_ORIGIN` en WebSocket coincida con la URL del frontend
- Revisa que el puerto 8081 esté libre

### Base de datos no conecta
- Verifica que PostgreSQL esté corriendo en puerto 5433
- Revisa credenciales en todos los .env
