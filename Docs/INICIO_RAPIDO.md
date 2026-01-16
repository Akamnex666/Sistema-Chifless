# 🚀 Inicio Rápido - Sistema de Gestión de Chifles

## Frontend (Next.js)

### Opción 1: Script Automático (Recomendado)

```powershell
cd frontend
.\start.ps1
```

El script verificará:
- ✅ Archivo de configuración `.env.local`
- ✅ Instalación de dependencias
- ✅ Estado de servicios backend
- ✅ Iniciará el servidor de desarrollo

### Opción 2: Manual

```powershell
cd frontend

# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
copy .env.example .env.local

# 3. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

---

## Backend Services

### 1. REST API (NestJS) - Puerto 3000

```powershell
cd Api-Rest
npm install
npm run start:dev
```

API disponible en: **http://localhost:3000/chifles**  
Swagger UI: **http://localhost:3000/api**

### 2. GraphQL (FastAPI) - Puerto 8001

```powershell
cd GraphQL\service

# Crear entorno virtual
python -m venv .venv
.venv\Scripts\Activate.ps1

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor
uvicorn app.main:app --reload --port 8001
```

GraphQL Playground: **http://localhost:8001/graphql**

### 3. WebSocket (Go) - Puerto 8081

```powershell
cd Websocket

# Instalar dependencias
go mod tidy

# Iniciar servidor
go run main.go
```

WebSocket disponible en: **http://localhost:8081**

---

## 🔧 Configuración de Base de Datos

### Con Docker (Recomendado)

```powershell
cd Api-Rest
docker-compose up -d
```

Esto iniciará:
- PostgreSQL en puerto 5432
- PgAdmin en puerto 5050

### Manual

1. Instalar PostgreSQL
2. Crear base de datos `sistema-chifles`
3. Configurar credenciales en `.env` de `Api-Rest/`

---

## ✅ Verificación de Servicios

### Verificar REST API
```powershell
curl http://localhost:3000/chifles/clientes
```

### Verificar GraphQL
Abre en navegador: http://localhost:8001/graphql

### Verificar WebSocket
El frontend mostrará el estado de conexión en el header.

---

## 📋 Orden de Inicio Recomendado

1. **Base de Datos** (Docker o PostgreSQL)
   ```powershell
   cd Api-Rest
   docker-compose up -d
   ```

2. **REST API** (NestJS)
   ```powershell
   cd Api-Rest
   npm run start:dev
   ```

3. **GraphQL** (FastAPI)
   ```powershell
   cd GraphQL\service
   uvicorn app.main:app --reload --port 8001
   ```

4. **WebSocket** (Go)
   ```powershell
   cd Websocket
   go run main.go
   ```

5. **Frontend** (Next.js)
   ```powershell
   cd frontend
   .\start.ps1
   ```

---

## 🎯 Acceso Rápido

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | http://localhost:3000 | Interfaz de usuario |
| REST API | http://localhost:3000/chifles | API REST |
| Swagger | http://localhost:3000/api | Documentación API |
| GraphQL | http://localhost:8001/graphql | Playground GraphQL |
| WebSocket | ws://localhost:8081 | Servidor WebSocket |
| PgAdmin | http://localhost:5050 | Admin PostgreSQL |

---

## 🐛 Solución de Problemas

### Puerto ya en uso

```powershell
# Verificar qué está usando el puerto
netstat -ano | findstr :3000

# Terminar proceso
taskkill /PID <PID> /F
```

### Error de CORS

Verifica que el backend tenga configurado:
```typescript
app.enableCors();
```

### WebSocket no conecta

1. Verifica que el servidor WebSocket esté corriendo
2. Revisa `.env` del WebSocket
3. Verifica `ALLOWED_ORIGIN=http://localhost:3000`

### Base de datos no conecta

Verifica las credenciales en `Api-Rest/.env`:
```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=admin123
DB_NAME=sistema-chifles
```

---

## 📚 Documentación Adicional

- [README Frontend](frontend/README_FRONTEND.md) - Documentación completa del frontend
- [README API REST](Api-Rest/README.md) - Documentación del API NestJS
- [README GraphQL](GraphQL/service/README.md) - Documentación del servicio GraphQL
- [README WebSocket](Websocket/readme.md) - Documentación del servidor WebSocket

---

## 🎓 Características Principales

### ✅ Implementado

- ✅ CRUD Clientes (REST)
- ✅ CRUD Productos (REST)
- ✅ CRUD Insumos (REST)
- ✅ Dashboard de Reportes (GraphQL)
- ✅ Notificaciones en tiempo real (WebSocket)
- ✅ Alertas de stock bajo
- ✅ Gráficos y estadísticas
- ✅ Layout responsivo

### 🔄 En Desarrollo

- 🔄 Gestión completa de Pedidos
- 🔄 Gestión de Órdenes de Producción
- 🔄 Gestión de Facturas
- 🔄 Autenticación y autorización
- 🔄 Paginación de tablas
- 🔄 Exportación de reportes

---

## 💡 Tips

- Usa el **script automático** `start.ps1` para iniciar rápidamente
- Verifica siempre que todos los **servicios backend** estén corriendo
- El **header** del frontend muestra el estado de conexión WebSocket
- Revisa la **consola del navegador** para ver logs de eventos
- Usa **Swagger** para probar endpoints de la API REST
- Usa **GraphQL Playground** para probar queries

---

**¡Listo para desarrollar! 🎉**
