# 🍌 Sistema Chifles - Guía Completa de Ejecución

## 📋 Tabla de Contenidos

- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Mapa de Puertos](#mapa-de-puertos)
- [Requisitos Previos](#requisitos-previos)
- [Ejecución con Docker](#ejecución-con-docker)
- [Ejecución sin Docker](#ejecución-sin-docker)
- [Base de Datos](#base-de-datos)
- [Variables de Entorno](#variables-de-entorno)
- [Comandos Útiles](#comandos-útiles)

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Next.js)                            │
│                              Puerto: 7171                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│   API REST    │         │   Auth Svc    │         │ AI Orchestr.  │
│    (NestJS)   │         │   (NestJS)    │         │   (NestJS)    │
│  Puerto: 3000 │         │  Puerto: 3001 │         │  Puerto: 3003 │
└───────┬───────┘         └───────┬───────┘         └───────────────┘
        │                         │
        ▼                         ▼
┌───────────────┐         ┌───────────────┐
│  PostgreSQL   │         │  PostgreSQL   │
│  Puerto: 5432 │         │  Puerto: 5433 │
└───────────────┘         └───────────────┘

┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│    GraphQL    │         │   WebSocket   │         │Payment Service│
│   (FastAPI)   │         │     (Go)      │         │   (NestJS)    │
│  Puerto: 8000 │         │  Puerto: 8080 │         │  Puerto: 3002 │
└───────────────┘         └───────────────┘         └───────────────┘
```

---

## 🔌 Mapa de Puertos

| Servicio | Puerto | Tecnología | Descripción |
|----------|--------|------------|-------------|
| **Api-Rest** | 3000 | NestJS | API principal del sistema |
| **Auth-Service** | 3001 | NestJS | Autenticación JWT |
| **Payment-Service** | 3002 | NestJS | Procesamiento de pagos |
| **AI-Orchestrator** | 3003 | NestJS | Orquestador de IA/LLM |
| **PostgreSQL (Api)** | 5432 | PostgreSQL 16 | BD del Api-Rest |
| **PostgreSQL (Auth)** | 5433 | PostgreSQL 16 | BD del Auth-Service |
| **Frontend** | 7171 | Next.js | Interfaz de usuario |
| **GraphQL** | 8000 | FastAPI | Servicio de reportes |
| **WebSocket** | 8080 | Go | Notificaciones real-time |

---

## ⚙️ Requisitos Previos

### Con Docker
- Docker Desktop
- Docker Compose

### Sin Docker
- **Node.js** v20+ y npm
- **Python** 3.12+
- **Go** 1.22+
- **PostgreSQL** 16+

---

## 🐳 Ejecución con Docker

### Opción 1: Levantar servicios individualmente

```powershell
# 1. Api-Rest + PostgreSQL
cd Api-Rest
docker-compose up --build -d

# 2. Auth-Service + PostgreSQL
cd Auth-Service
docker-compose up --build -d

# 3. AI Orchestrator
cd ai-orchestrator
docker-compose up --build -d

# 4. Payment Service
cd Payment-Service
docker-compose up --build -d

# 5. GraphQL
cd GraphQL
docker-compose up --build -d

# 6. WebSocket
cd Websocket
docker-compose up --build -d

# 7. Frontend
cd frontend
docker-compose up --build -d
```

### Ver logs de un servicio

```powershell
docker-compose logs -f <nombre-servicio>
```

### Detener servicios

```powershell
docker-compose down
```

---

## 💻 Ejecución sin Docker

### 1️⃣ Base de Datos PostgreSQL

**Instalar PostgreSQL 16** desde [postgresql.org](https://www.postgresql.org/download/)

**Crear las bases de datos:**

```sql
-- Conectar a PostgreSQL
psql -U postgres

-- Crear BD para Api-Rest
CREATE USER admin WITH PASSWORD 'admin123';
CREATE DATABASE "sistema-chifles" OWNER admin;
GRANT ALL PRIVILEGES ON DATABASE "sistema-chifles" TO admin;

-- Crear BD para Auth-Service
CREATE USER auth_user WITH PASSWORD 'auth_secret_2024';
CREATE DATABASE auth_db OWNER auth_user;
GRANT ALL PRIVILEGES ON DATABASE auth_db TO auth_user;

\q
```

### 2️⃣ Api-Rest (Puerto 3000)

```powershell
cd Api-Rest

# Copiar variables de entorno
cp .env.example .env
# Editar .env si es necesario

# Instalar dependencias
npm ci

# Ejecutar en desarrollo
npm run start:dev

# O compilar y ejecutar en producción
npm run build
npm run start:prod
```

**Verificar:** http://localhost:3000/api (Swagger UI)

### 3️⃣ Auth-Service (Puerto 3001)

```powershell
cd Auth-Service

# Copiar variables de entorno
cp .env.example .env

# Instalar dependencias
npm ci

# Ejecutar en desarrollo
npm run start:dev
```

**Verificar:** http://localhost:3001/api/docs

### 4️⃣ AI Orchestrator (Puerto 3003)

```powershell
cd ai-orchestrator

# Copiar variables de entorno
cp .env.example .env
# IMPORTANTE: Configurar las API Keys de LLM

# Instalar dependencias
npm ci

# Ejecutar en desarrollo
npm run start:dev
```

**Verificar:** http://localhost:3003/api

### 5️⃣ Payment Service (Puerto 3002)

```powershell
cd Payment-Service

# Copiar variables de entorno
cp .env.example .env

# Instalar dependencias
npm ci

# Ejecutar en desarrollo
npm run start:dev
```

### 6️⃣ GraphQL Service (Puerto 8000)

```powershell
cd GraphQL

# Crear entorno virtual
python -m venv .venv

# Activar entorno (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Activar entorno (Linux/Mac)
source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Copiar variables de entorno
cp .env.example .env

# Ejecutar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Verificar:** http://localhost:8000/graphql

### 7️⃣ WebSocket Server (Puerto 8080)

```powershell
cd Websocket

# Copiar variables de entorno
cp .env.example .env

# Descargar dependencias
go mod tidy

# Ejecutar servidor
go run .
```

**Verificar:** ws://localhost:8080/ws

### 8️⃣ Frontend (Puerto 7171)

```powershell
cd frontend

# Copiar variables de entorno
cp .env.example .env.local

# Instalar dependencias
npm ci

# Ejecutar en desarrollo
npm run dev

# O compilar y ejecutar en producción
npm run build
npm run start
```

**Verificar:** http://localhost:7171

---

## 🗄️ Base de Datos

### Configuración PostgreSQL sin Docker

| Base de Datos | Puerto | Usuario | Password | Nombre BD |
|---------------|--------|---------|----------|-----------|
| Api-Rest | 5432 | admin | admin123 | sistema-chifles |
| Auth-Service | 5433 | auth_user | auth_secret_2024 | auth_db |

> **Nota:** Si usas una sola instancia de PostgreSQL, puedes usar el puerto 5432 para ambas BD. Solo asegúrate de actualizar los `.env` correspondientes.

### Usando el mismo puerto para ambas BD

```sql
-- Si prefieres usar el mismo servidor PostgreSQL (puerto 5432)
-- Solo crea ambas bases de datos:

CREATE USER admin WITH PASSWORD 'admin123';
CREATE DATABASE "sistema-chifles" OWNER admin;

CREATE USER auth_user WITH PASSWORD 'auth_secret_2024';
CREATE DATABASE auth_db OWNER auth_user;
```

Luego actualiza `Auth-Service/.env`:
```env
DB_PORT=5432  # Cambiar de 5433 a 5432
```

---

## 🔐 Variables de Entorno

Cada servicio tiene un archivo `.env.example`. Copia y personaliza:

```powershell
# Para cada servicio
cp .env.example .env
```

### Resumen de Variables Importantes

| Servicio | Variable | Descripción |
|----------|----------|-------------|
| Api-Rest | `DB_HOST` | `localhost` (sin Docker) o `api-postgres-sistema-chifles` (con Docker) |
| Api-Rest | `WS_URL` | URL del WebSocket notify endpoint |
| Auth-Service | `DB_HOST` | `localhost` (sin Docker) o `auth-db` (con Docker) |
| Auth-Service | `JWT_SECRET` | Clave secreta para JWT |
| AI-Orchestrator | `GROQ_API_KEY` | API Key de Groq (gratis) |
| Frontend | `NEXT_PUBLIC_*` | URLs de los servicios backend |

---

## 📝 Comandos Útiles

### Docker

```powershell
# Ver contenedores activos
docker ps

# Ver logs
docker-compose logs -f

# Reconstruir sin cache
docker-compose build --no-cache

# Detener y eliminar todo
docker-compose down -v
```

### Bases de Datos

```powershell
# Conectar a PostgreSQL (Api-Rest)
psql -h localhost -p 5432 -U admin -d sistema-chifles

# Conectar a PostgreSQL (Auth)
psql -h localhost -p 5433 -U auth_user -d auth_db
```

### Verificación de Servicios

```powershell
# Verificar que todos los puertos están en uso
netstat -an | findstr "3000 3001 3002 3003 5432 5433 7171 8000 8080"
```

---

## 🚀 Orden Recomendado de Inicio

1. **PostgreSQL** (si no usas Docker)
2. **WebSocket** (Go) - Puerto 8080
3. **Api-Rest** - Puerto 3000
4. **Auth-Service** - Puerto 3001
5. **GraphQL** - Puerto 8000
6. **Payment-Service** - Puerto 3002
7. **AI-Orchestrator** - Puerto 3003
8. **Frontend** - Puerto 7171

---

## ❓ Solución de Problemas

### Puerto en uso
```powershell
# Ver qué proceso usa un puerto
netstat -ano | findstr :<PUERTO>

# Matar proceso por PID
taskkill /PID <PID> /F
```

### Error de conexión a BD
- Verificar que PostgreSQL está corriendo
- Verificar credenciales en `.env`
- Verificar que la BD existe

### CORS errors en Frontend
- Verificar que el backend tiene habilitado CORS para `http://localhost:7171`
- Verificar las URLs en `.env.local` del frontend

---

## 📚 Documentación Adicional

- [Payment-Service Integration](Payment-Service/README.md)
- [AI Implementation Guide](Docs/GUIA_IMPLEMENTACION_PUNTO_3.md)
- [WebSocket Notifications](Docs/WEBSOCKET_NOTIFICATIONS.md)
- [Testing Guide](Docs/README_TESTING.md)
