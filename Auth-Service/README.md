# 🔐 Auth Service - Sistema Chifles

Microservicio independiente de autenticación con JWT Access/Refresh Tokens.

## 📋 Características

- ✅ Registro de usuarios con hash bcrypt
- ✅ Login con Access Token (15min) + Refresh Token (7d)
- ✅ Renovación de tokens
- ✅ Logout con blacklist de tokens
- ✅ Rate limiting en endpoints sensibles
- ✅ Validación de tokens para otros microservicios
- ✅ Base de datos PostgreSQL dedicada

## 🚀 Inicio Rápido

### Opción 1: Docker Compose (Recomendado)

```bash
cd Auth-Service
docker-compose up -d
```

Esto levanta:
- PostgreSQL en puerto `5433`
- Auth Service en puerto `3001`

### Opción 2: Desarrollo Local

```bash
# 1. Levantar solo la base de datos
docker-compose up -d auth-db

# 2. Instalar dependencias
npm install

# 3. Iniciar en modo desarrollo
npm run start:dev
```

## 📡 Endpoints

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registro de usuario | No |
| POST | `/api/auth/login` | Login (retorna tokens) | No |
| POST | `/api/auth/refresh` | Renovar access token | Refresh Token |
| POST | `/api/auth/logout` | Cerrar sesión | Access Token |
| GET | `/api/auth/me` | Datos del usuario actual | Access Token |
| GET | `/api/auth/validate` | Validar token (para otros servicios) | Access Token |

## 🗄️ Base de Datos

Puerto: `5433` (para no conflictuar con el PostgreSQL principal en `5432`)

### Tablas:
- `users` - Usuarios registrados
- `refresh_tokens` - Tokens de refresh activos
- `revoked_tokens` - Blacklist de tokens revocados

## 🔧 Variables de Entorno

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=auth_user
DB_PASSWORD=auth_secret_2024
DB_DATABASE=auth_db
JWT_SECRET=tu_super_secreto_jwt
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
THROTTLE_TTL=60000
THROTTLE_LIMIT=5
```

## 📚 Documentación API

Swagger disponible en: `http://localhost:3001/docs`

## 🔗 Integración con otros servicios

Los otros microservicios pueden validar tokens llamando a:

```
GET http://localhost:3001/api/auth/validate
Headers: Authorization: Bearer <access_token>
```

Respuesta exitosa:
```json
{
  "valid": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```
