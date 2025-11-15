# 🛠️ Comandos Útiles - Sistema de Gestión de Chifles

## Frontend (Next.js)

### Desarrollo
```powershell
cd frontend
npm run dev              # Iniciar en modo desarrollo
npm run build            # Compilar para producción
npm run start            # Ejecutar versión de producción
npm run lint             # Verificar errores de código
```

### Scripts Personalizados
```powershell
.\start.ps1              # Script de inicio automático
```

---

## Backend - REST API (NestJS)

### Desarrollo
```powershell
cd Api-Rest
npm install              # Instalar dependencias
npm run start            # Iniciar servidor
npm run start:dev        # Modo desarrollo con hot-reload
npm run start:debug      # Modo debug
npm run build            # Compilar proyecto
```

### Base de Datos
```powershell
# Con Docker
docker-compose up -d           # Iniciar PostgreSQL + PgAdmin
docker-compose down            # Detener servicios
docker-compose logs -f         # Ver logs

# Acceso directo a PostgreSQL
docker exec -it <container-id> psql -U admin -d sistema-chifles
```

### Testing
```powershell
npm run test             # Tests unitarios
npm run test:e2e         # Tests end-to-end
npm run test:cov         # Coverage
```

---

## Backend - GraphQL (FastAPI)

### Desarrollo
```powershell
cd GraphQL\service

# Configurar entorno virtual
python -m venv .venv
.venv\Scripts\Activate.ps1

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor
uvicorn app.main:app --reload --port 8001
uvicorn app.main:app --reload --port 8001 --log-level debug

# Ver logs detallados
$env:LOG_LEVEL="DEBUG"; uvicorn app.main:app --reload --port 8001
```

### Testing
```powershell
pytest                   # Ejecutar tests
pytest --cov             # Con coverage
pytest -v                # Verbose
pytest tests/test_specific.py  # Test específico
```

---

## Backend - WebSocket (Go)

### Desarrollo
```powershell
cd Websocket

# Instalar/actualizar dependencias
go mod tidy
go mod download

# Ejecutar
go run main.go

# Compilar
go build -o websocket-server.exe main.go

# Ejecutar compilado
.\websocket-server.exe
```

### Variables de Entorno
```powershell
# Ver variables actuales
Get-Content .env

# Modificar temporalmente
$env:PORT=8082
$env:WS_SECRET="nueva_clave"
go run main.go
```

---

## Docker

### Comandos Generales
```powershell
# Ver contenedores activos
docker ps

# Ver todos los contenedores
docker ps -a

# Ver logs
docker logs <container-name>
docker logs -f <container-name>  # Seguir logs

# Entrar a un contenedor
docker exec -it <container-name> bash
docker exec -it <container-name> sh

# Detener contenedor
docker stop <container-name>

# Eliminar contenedor
docker rm <container-name>

# Ver imágenes
docker images

# Eliminar imagen
docker rmi <image-name>
```

### Limpieza
```powershell
# Limpiar contenedores detenidos
docker container prune

# Limpiar imágenes sin usar
docker image prune

# Limpiar todo (CUIDADO)
docker system prune -a
```

---

## Git

### Workflow Básico
```powershell
# Ver estado
git status

# Agregar cambios
git add .
git add <file>

# Commit
git commit -m "Mensaje descriptivo"

# Push
git push origin main

# Pull
git pull origin main

# Ver historial
git log --oneline --graph
```

### Branches
```powershell
# Crear branch
git checkout -b feature/nueva-funcionalidad

# Cambiar de branch
git checkout main

# Listar branches
git branch

# Eliminar branch
git branch -d feature/nombre

# Merge
git checkout main
git merge feature/nombre
```

---

## Node.js / npm

### Gestión de Dependencias
```powershell
# Instalar dependencia
npm install <package>
npm install <package> --save-dev

# Actualizar dependencias
npm update
npm outdated  # Ver actualizaciones disponibles

# Limpiar caché
npm cache clean --force

# Reinstalar todo
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json
npm install
```

---

## Python / pip

### Gestión de Dependencias
```powershell
# Activar entorno virtual
.venv\Scripts\Activate.ps1

# Desactivar
deactivate

# Instalar dependencia
pip install <package>

# Actualizar dependencia
pip install --upgrade <package>

# Generar requirements.txt
pip freeze > requirements.txt

# Instalar desde requirements.txt
pip install -r requirements.txt

# Ver paquetes instalados
pip list
```

---

## PostgreSQL

### Conexión
```powershell
# Con psql
psql -h localhost -p 5432 -U admin -d sistema-chifles

# Con Docker
docker exec -it <postgres-container> psql -U admin -d sistema-chifles
```

### Comandos SQL Útiles
```sql
-- Ver todas las tablas
\dt

-- Describir tabla
\d nombre_tabla

-- Ver bases de datos
\l

-- Cambiar de base de datos
\c nombre_base

-- Salir
\q

-- Backup
pg_dump -U admin sistema-chifles > backup.sql

-- Restore
psql -U admin sistema-chifles < backup.sql
```

---

## Debugging

### Frontend (Next.js)
```powershell
# Ver logs detallados
npm run dev -- --inspect

# Abrir DevTools de Node.js
chrome://inspect
```

### Backend (NestJS)
```powershell
# Modo debug
npm run start:debug

# Adjuntar debugger en VS Code (launch.json)
```

### GraphQL (FastAPI)
```powershell
# Logs detallados
$env:LOG_LEVEL="DEBUG"
uvicorn app.main:app --reload --port 8001 --log-level debug
```

---

## Monitoreo

### Ver puertos en uso
```powershell
# Ver todos los puertos
netstat -ano

# Ver puerto específico
netstat -ano | findstr :3000
netstat -ano | findstr :8001
netstat -ano | findstr :8081

# Matar proceso por PID
taskkill /PID <PID> /F
```

### Verificar servicios
```powershell
# REST API
curl http://localhost:3000/chifles/clientes
Invoke-WebRequest http://localhost:3000/chifles/clientes

# GraphQL
Invoke-WebRequest http://localhost:8001/graphql

# WebSocket (en navegador o con herramienta)
# ws://localhost:8081
```

---

## Testing

### Frontend
```powershell
cd frontend
npm run test             # Jest
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage
```

### Backend REST
```powershell
cd Api-Rest
npm run test
npm run test:e2e
npm run test:cov
```

### Backend GraphQL
```powershell
cd GraphQL\service
pytest
pytest --cov
pytest -v
```

---

## Performance

### Análisis de Bundle (Frontend)
```powershell
npm run build
# Revisar .next/analyze/
```

### Profiling de Base de Datos
```sql
-- Activar logging de queries lentas (PostgreSQL)
SET log_min_duration_statement = 1000;

-- Ver queries activas
SELECT * FROM pg_stat_activity;
```

---

## Producción

### Build Frontend
```powershell
cd frontend
npm run build
npm run start
```

### Build Backend REST
```powershell
cd Api-Rest
npm run build
node dist/main.js
```

### Build Backend GraphQL
```powershell
cd GraphQL\service
# FastAPI no requiere build, usar uvicorn directamente
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

### Build WebSocket
```powershell
cd Websocket
go build -o websocket-server.exe main.go
.\websocket-server.exe
```

---

## Mantenimiento

### Actualizar Dependencias

#### Frontend
```powershell
cd frontend
npm update
npm outdated
npm audit fix
```

#### Backend REST
```powershell
cd Api-Rest
npm update
npm audit fix
```

#### Backend GraphQL
```powershell
cd GraphQL\service
pip list --outdated
pip install --upgrade <package>
```

#### WebSocket
```powershell
cd Websocket
go get -u ./...
go mod tidy
```

---

## Troubleshooting Rápido

### Puerto ocupado
```powershell
netstat -ano | findstr :<PORT>
taskkill /PID <PID> /F
```

### Error de módulos (Node.js)
```powershell
Remove-Item node_modules -Recurse -Force
npm install
```

### Error de base de datos
```powershell
docker-compose down
docker-compose up -d
```

### Error de caché (Next.js)
```powershell
Remove-Item .next -Recurse -Force
npm run build
```

### WebSocket no conecta
1. Verificar que el servidor esté corriendo
2. Revisar firewall
3. Verificar CORS en `.env`

---

## Atajos VS Code

- `Ctrl + P` - Buscar archivo
- `Ctrl + Shift + P` - Command Palette
- `F5` - Iniciar debugging
- `Ctrl + `` - Toggle terminal
- `Ctrl + B` - Toggle sidebar
- `Ctrl + /` - Comentar línea
- `Alt + Shift + F` - Formatear documento
- `Ctrl + Shift + F` - Buscar en archivos

---

## 🎯 Checklist de Inicio Diario

```powershell
# 1. Verificar que Docker esté corriendo
docker ps

# 2. Iniciar base de datos (si no está corriendo)
cd Api-Rest
docker-compose up -d

# 3. Iniciar REST API
cd Api-Rest
npm run start:dev

# 4. Iniciar GraphQL
cd GraphQL\service
.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8001

# 5. Iniciar WebSocket
cd Websocket
go run main.go

# 6. Iniciar Frontend
cd frontend
npm run dev
```

---

**¡Todo listo para desarrollar! 🚀**
