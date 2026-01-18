# Sistema-Chifles — Run & Dev Guide

## 📢 Actualización: Implementación Punto 3 (IA & MCP)

Si estás buscando cómo implementar el **AI Orchestrator, MCP Server y las extensiones Frontend**, por favor consulta la guía dedicada:
👉 **[GUIA_IMPLEMENTACION_PUNTO_3.md](GUIA_IMPLEMENTACION_PUNTO_3.md)**

Esta guía contiene los pasos detallados para:
1. Crear el servicio de IA y configuración de MCP.
2. Integrar Gemini/OpenAI mediante Strategy Pattern.
3. Extender el Frontend con interfaz de Chat Multimodal.

---

Este README centraliza los pasos para levantar y probar todos los componentes del proyecto "Sistema-Chifles":
- Api-Rest (NestJS con Postgres, Swagger)
- Frontend (Next.js)
- GraphQL (FastAPI + Strawberry)
- WebSocket server (Go)

He escrito instrucciones pensadas para un entorno Windows con PowerShell (`pwsh.exe`) y Docker instalado.

---

## Requisitos previos
- Docker & Docker Compose (usable desde PowerShell)
- Node.js (v18+ recomendado) y npm
- Python 3.10+ (para GraphQL service)
- Go 1.20+ (para WebSocket)
- Opcional: Postman o cliente REST

---

## Resumen de puertos usados
- API REST (NestJS): `http://localhost:3000` (Swagger UI: `http://localhost:3000/api`)
- Frontend (Next dev): `http://localhost:7171` (según `frontend/package.json`)
- GraphQL service (uvicorn): `http://localhost:8001` (según `GraphQL/service/README.md`)
- Websocket server: `http://localhost:8081` (ws en `ws://localhost:8081/ws` y notificaciones HTTP en `/notify`)

---

## 1) Levantar Api-Rest (Postgres + API)
La carpeta del backend es `Api-Rest/`. En este proyecto el `docker-compose.yml` en `Api-Rest/` define dos servicios: la API y Postgres.

1. Abre PowerShell en la carpeta `Api-Rest`:

```powershell
cd C:\Sistema-Chifles\Api-Rest
```

2. Verifica el archivo `.env` (ya viene con valores de ejemplo). Asegúrate de que `JWT_SECRET` tenga un valor y que no contenga comillas innecesarias.

3. Levanta los contenedores (modo desarrollo con watch):

```powershell
docker-compose up --build -d
```

4. Verifica que los contenedores estén corriendo:

```powershell
docker-compose ps
# o
docker ps --filter name=api-rest-sistema
```

5. Logs (si quieres verlos):

```powershell
docker-compose logs -f api-rest-sistema
```

Notas importantes:
- El `docker-compose.yml` monta el código fuente en el contenedor y usa `CHOKIDAR_USEPOLLING=true` y un volumen anónimo `/app/node_modules` para evitar problemas de watch en Windows/WSL. No cambies el volumen `/app/node_modules` si trabajas en Windows.

---

## 2) Probar Swagger y autenticación JWT
La API incluye un endpoint dev para login que devuelve un JWT:
- `POST /chifles/auth/login` — body JSON: `{ "email": "dev@example.com", "password": "chifles" }` → devuelve `{ "access_token": "eyJ..." }`.

Pasos desde Swagger UI (recomendado):
1. Abre `http://localhost:3000/api`.
2. Pulsa `Authorize` (candado en la esquina superior derecha).
3. En la caja de valores pega SOLO el token (o `Bearer <token>` — la API ahora tolera ambos). Recomendado: pegar SOLO el token, por ejemplo:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Pulsa `Authorize` y luego `Close`.
5. En el endpoint `GET /chifles/clientes` pulsa `Try it out` → `Execute`. Deberías ver `Authorization: Bearer <token>` en Request headers y recibir `200` con datos.

Si ves `401`:
- Asegúrate de pulsar `Authorize` (no sólo Close) en el modal.
- Si en la consola del navegador aparece `Authorization: Bearer Bearer ...` entonces pegaste `Bearer <token>` en el modal y Swagger le añadió su propio `Bearer ` → en este proyecto el backend ya corrige dobles prefijos, pero si tu servidor no lo hiciera, pega sólo el token.

Comprobar token desde PowerShell (ejemplo):

```powershell
$body = @{ email = 'dev@example.com'; password = 'chifles' } | ConvertTo-Json
$resp = Invoke-RestMethod -Uri 'http://localhost:3000/chifles/auth/login' -Method Post -Body $body -ContentType 'application/json'
$token = $resp.access_token
$h = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri 'http://localhost:3000/chifles/clientes' -Headers $h -Method GET
```

---

## 3) Levantar el Frontend (Next.js)
Carpeta: `frontend/`.

1. Abre PowerShell en la carpeta `frontend`:

```powershell
cd C:\Sistema-Chifles\frontend
```

2. Instala dependencias:

```powershell
npm ci
```

3. Inicia en modo desarrollo (puerto 7171 según `package.json`):

```powershell
npm run dev
# abrir http://localhost:7171
```

Notas:
- El frontend usa `axios`, `@apollo/client` y `socket.io-client` para comunicarse con la API, GraphQL y WebSocket. Asegúrate de que los servicios estén en ejecución y sus URLs coincidan con lo que espera el frontend (revisa `frontend/src/services` y `frontend/.env` si existe).

---

## 4) Levantar GraphQL service (reportes)
Carpeta: `GraphQL/service/`.

1. Abre PowerShell en `GraphQL/service`:

```powershell
cd C:\Sistema-Chifles\GraphQL\service
```

2. Crear y activar entorno virtual (Windows PowerShell):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

3. Ejecutar el server (uvicorn):

```powershell
uvicorn app.main:app --reload --port 8001
```

4. Probar: abrir `http://localhost:8001` (o endpoint GraphQL según la configuración interna).

---

## 5) Levantar WebSocket server (Go)
Carpeta: `Websocket/`.

1. Abre PowerShell en `Websocket`:

```powershell
cd C:\Sistema-Chifles\Websocket
```

2. Descargar dependencias y ejecutar:

```powershell
go mod tidy
go run .
```

3. El servidor por defecto expone:
- HTTP notify endpoint (para que el API REST notifique): por ejemplo `http://localhost:8081/notify`
- WebSocket en `ws://localhost:8081/ws`

4. Configuración: revisa `Websocket/.env` y ajusta `WS_SECRET` (debe coincidir con `WS_SECRET` de la API REST si se usa autenticación compartida para notificaciones). El README interno muestra ejemplos.

---

## 6) Conexión entre servicios y variables importantes
- `Api-Rest` en `Api-Rest/.env` contiene `DB_*`, `JWT_SECRET`, `WS_URL`, `WS_SECRET`. Asegúrate de que:
  - `DB_HOST` apunte a `api-postgres-sistema-chifles` cuando uses docker-compose.
  - `WS_URL` apunte al endpoint del WebSocket (por ejemplo `http://host.docker.internal:8081/notify` o la IP correcta dentro de docker). En `Websocket/README.md` hay nota para usar `172.17.0.1:8081` si se necesita.

---

## 7) Probar notificaciones WebSocket (flujo típico)
1. Levanta WebSocket server (`go run .`).
2. Levanta API REST (docker-compose) y comprueba `.env` con `WS_URL` apuntando a la URL del notify del websocket.
3. Conecte un cliente WebSocket (por ejemplo extensión "Simple WebSocket Client" o `wscat`) a `ws://localhost:8081/ws`.
4. Realiza una acción en la API que dispare notificación (p. ej. crear un producto). El WebSocket debe recibir el mensaje.

---

## 8) Comprobaciones rápidas y solución de problemas
- `401 Unauthorized` en Swagger:
  - Revisa que hiciste `Authorize` correctamente.
  - Si el header en DevTools aparece como `Authorization: Bearer Bearer <token>`, pega solo el token en el modal o refresca Swagger; el backend ya fue parcheado para aceptar dobles prefijos.
- `watch` reinicios en Windows: ya se establecieron variables `CHOKIDAR_USEPOLLING=true` y un volumen `/app/node_modules` en `docker-compose.yml` para minimizar problemas.
- Si la API no arranca en Docker: ejecutar `docker-compose logs api-rest-sistema` para ver errores de compilación o de entorno.

---

## 9) Comandos útiles (resumen)
- Levantar API y DB (desde `Api-Rest`):

```powershell
cd C:\Sistema-Chifles\Api-Rest
docker-compose up --build -d
```

- Ver logs API:

```powershell
docker-compose logs -f api-rest-sistema
```

- Obtener token (PowerShell):

```powershell
$body = @{ email = 'dev@example.com'; password = 'chifles' } | ConvertTo-Json
$resp = Invoke-RestMethod -Uri 'http://localhost:3000/chifles/auth/login' -Method Post -Body $body -ContentType 'application/json'
$token = $resp.access_token
```

- Probar endpoint protegido con token (PowerShell):

```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/chifles/clientes' -Headers @{ Authorization = "Bearer $token" } -Method GET
```

- Iniciar frontend:

```powershell
cd C:\Sistema-Chifles\frontend
npm ci
npm run dev
# luego abrir http://localhost:7171
```

- Iniciar GraphQL:

```powershell
cd C:\Sistema-Chifles\GraphQL\service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

- Iniciar Websocket (Go):

```powershell
cd C:\Sistema-Chifles\Websocket
go mod tidy
go run .
```

---

## 10) Qué puedo hacer por ti a continuación
- Generar un script `run-all.ps1` que orqueste la puesta en marcha (levantar docker-compose, arrancar GraphQL en venv y Websocket si tienes Go instalado).
- Revisar `frontend` para asegurar que los endpoints apuntan a `http://localhost:3000`/`8001`/`8081` y actualizar `.env.local` si lo deseas.
- Añadir documentación adicional para despliegue en producción (builds, nginx, variables seguras, revocación de tokens).

---

Si quieres que genere el `run-all.ps1` o que edite/añada un `.env.example` en cada servicio, dime y lo hago ahora.
