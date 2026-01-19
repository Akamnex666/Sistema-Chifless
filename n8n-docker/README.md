# n8n Setup & Configuration

## 🚀 Levantando n8n con Docker

### Paso 1: Navegar a la carpeta

```bash
cd n8n-docker
```

### Paso 2: Levantar servicios

```bash
docker-compose up -d
```

Esto levanta:

- ✅ **n8n** en `http://localhost:5678`
- ✅ **PostgreSQL** en `localhost:5434` (para n8n, separado de Api-Rest)

### Paso 3: Verificar que está corriendo

```bash
docker-compose ps
```

Deberías ver:

```
CONTAINER ID    IMAGE                PORTS                    STATUS
xxxxx          n8nio/n8n:latest     0.0.0.0:5678->5678/tcp  Up 2 minutes
xxxxx          postgres:15-alpine   0.0.0.0:5434->5432/tcp  Up 2 minutes
```

### Paso 4: Acceder a n8n

Abre en tu navegador: **http://localhost:5678**

Credenciales por defecto:

- Email: `admin@example.com`
- Password: `password123`

---

## ⚙️ Configuración Variables de Entorno

Todas las variables están en `.env.n8n`:

```env
# Base de datos
DB_HOST=postgres
DB_PORT=5432
DB_NAME=n8n
DB_USER=zhali
DB_PASSWORD=Holaquehace

# n8n
N8N_HOST=localhost
N8N_PORT=5678

# Integración con Payment Service
PAYMENT_SERVICE_URL=http://host.docker.internal:3002
API_REST_URL=http://host.docker.internal:3000

# JWT compartido
JWT_SECRET=chifles_super_secret_jwt_key_2024
WEBSOCKET_SECRET=super_secret_key_123
```

**Nota**: Desde dentro del contenedor Docker, para acceder a localhost del host, usamos `host.docker.internal` (en Docker Desktop).

---

## 📝 Archivo docker-compose.yml explicado

### Servicio n8n:

```yaml
n8n:
  image: n8nio/n8n:latest
  ports:
    - "5678:5678" # Puerto de n8n
  environment:
    DB_TYPE: postgresdb # Base de datos PostgreSQL
    N8N_HOST: localhost
    N8N_PORT: 5678
```

### Servicio PostgreSQL:

```yaml
postgres:
  image: postgres:15-alpine
  ports:
    - "5434:5432" # Puerto diferente a Api-Rest (5433)
  volumes:
    - postgres_data:/var/lib/postgresql/data
```

**¿Por qué dos PostgreSQL?**

- Api-Rest usa: `localhost:5433` (user: zhali, db: chifles)
- n8n usa: `localhost:5434` (user: zhali, db: n8n)

Si quieres que n8n comparta la misma BD que Api-Rest, puedes cambiar en `.env.n8n`:

```env
DB_HOST=host.docker.internal
DB_PORT=5433
DB_NAME=chifles
```

---

## 🛑 Detener n8n

```bash
# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (perder datos)
docker-compose down -v
```

---

## 🔍 Verificar logs

```bash
# Ver logs de n8n
docker-compose logs -f n8n

# Ver logs de PostgreSQL
docker-compose logs -f postgres
```

---

## 🔧 Troubleshooting

### Error: "Cannot connect to database"

```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps postgres

# Ver logs de postgres
docker-compose logs postgres
```

### Error: "Port 5678 is already in use"

```bash
# Cambiar puerto en docker-compose.yml
ports:
  - "5679:5678"  # Usar 5679 en lugar de 5678
```

### n8n no conecta a Payment Service

```bash
# Dentro de n8n, usar esta URL en webhooks:
http://host.docker.internal:3002/webhooks/receive

# O si estás usando una red Docker compartida:
http://api-rest:3000
```

---

## 📚 Próximos pasos (Tasks 16-18)

Una vez que n8n esté corriendo, vamos a crear 3 workflows:

1. **Task 16: Payment Handler Workflow**
   - Recibe webhook de pago confirmado
   - Valida payload
   - Actualiza base de datos
   - Notifica WebSocket
   - Envía email

2. **Task 17: Partner Handler Workflow**
   - Recibe webhook de partner
   - Verifica HMAC
   - Procesa evento
   - Responde ACK

3. **Task 18: Scheduled Task Workflow**
   - Cron diario a las 08:00
   - Genera reporte de pagos
   - Limpia webhooks fallidos
   - Archiva datos

---

## 💾 Datos Persistentes

Los datos de n8n se guardan en volúmenes Docker:

- `n8n_data:/home/node/.n8n` → Workflows, credenciales
- `postgres_data:/var/lib/postgresql/data` → Base de datos

Cuando ejecutes `docker-compose down`, los datos se preservan.

---

## 🔐 Seguridad (Importante!)

**ANTES DE PRODUCCIÓN:**

1. Cambiar credenciales por defecto
2. Usar HTTPS
3. Configurar N8N_USER_MANAGEMENT_DISABLED=false
4. Agregar autenticación de dos factores
5. Usar variables de entorno seguras

Documento de referencia: `Payment-Service/PARTNER_INTEGRATION.md`

---

## Status: ✅ COMPLETADO

Task 15 implementada correctamente.

- ✅ docker-compose.yml creado
- ✅ .env.n8n configurado
- ✅ PostgreSQL configurado
- ✅ n8n ready para workflows

**Próximo**: Task 16 - Crear Payment Handler Workflow
