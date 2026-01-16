# Sistema-Chifles — GraphQL Reports Service (Guía de prueba)

Este documento contiene instrucciones completas para probar el sistema GraphQL que consume la API REST (`Api-Rest`). Si prefieres, puedo reemplazar el README existente por este contenido.

## Resumen rápido
- Levanta la API REST en `C:\Sistema-Chifles\Api-Rest` con Docker Compose.
- Configura `GraphQL/service/.env` (API_URL apunta al REST).
- Prepara virtualenv en `GraphQL/service` y instala dependencias.
- Ejecuta `uvicorn` y prueba consultas en `http://127.0.0.1:8001/graphql`.

## Contenido completo

### 1) Prerrequisitos
- Docker y Docker Compose.
- Python 3.11 o 3.12 recomendado. Python 3.14 funciona pero puede mostrar warnings con Pydantic v1.

### 2) Variables de entorno
Copia `.env.example` en `GraphQL/service` a `.env` y ajusta:

```
API_URL=http://127.0.0.1:3000
PORT=8001
DEBUG=true
```

Usa `127.0.0.1` en Windows para evitar IPv6 issues.

### 3) Levantar la API REST
En `C:\Sistema-Chifles\Api-Rest`:

```powershell
docker compose up --build -d
docker compose logs --tail 200
```

Asegúrate de que la API responde en `http://127.0.0.1:3000` (por defecto).

### 4) Preparar el entorno GraphQL
En `C:\Sistema-Chifles\GraphQL\service`:

```powershell
python -m venv .venv
& .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 5) Ejecutar el servicio GraphQL
Recomendado arrancar sin reload en Windows para evitar problemas con subprocesos:

```powershell
& uvicorn.exe app.main:app --port 8001
```

Si prefieres modo desarrollo:

```powershell
& .venv\Scripts\uvicorn.exe app.main:app --reload --port 8001
```

Si el puerto 8001 está ocupado, cambia a 8002: `--port 8002`.

### 6) Probar consultas
- GraphiQL UI: `http://127.0.0.1:8001/graphql`

- Ejemplo `productosMasVendidos`:

 - Ejemplo `productosMasVendidos`:

```graphql
query {
  productosMasVendidos(limite: 5) {
    productoId
    productoNombre
    cantidadVendida
  }
}
```

- Ejemplo `pedidosPorCliente`:

```graphql
query {
  pedidosPorCliente(clienteId: 1, fechaInicio: "2025-01-01", fechaFin: "2025-12-31") {
    id
    clienteId
    fecha
    total
  }
}
```

- cURL (PowerShell):

```powershell
$body = '{"query":"{ productosMasVendidos(limite:5){ productoId productoNombre cantidadVendida } }"}'
curl -X POST -H "Content-Type: application/json" -d $body http://127.0.0.1:8001/graphql
```

### 7) Tests
En `GraphQL/service` (venv activo):

```powershell
pytest -q
```

Los tests usan `respx` para simular respuestas del REST.

### 8) Docker (opcional)
Construir imagen para GraphQL:

```powershell
docker build -t sistema-chifles-graphql:local .
docker run -p 8001:8001 --env-file .env sistema-chifles-graphql:local
```

### 9) Problemas comunes y soluciones
- `ModuleNotFoundError: No module named 'app'`: ejecuta `uvicorn` desde `GraphQL/service` o usa `.venv\Scripts\uvicorn.exe app.main:app`.
- `TypeError: GraphQL.__init__() got an unexpected keyword argument 'context_getter'`: usa `strawberry.fastapi.GraphQLRouter` y registra con `app.include_router(...)` (ya corregido en `app/main.py`).
- Puerto en uso: cambia puerto o mata el proceso que lo ocupa.
- Pydantic warning en Python 3.14: informativo; usa Python 3.11/3.12 para evitarlo.

---

Si quieres, reemplazo el README actual por este contenido o lo copio al README raíz. También puedo ejecutar `pytest` aquí y pegar los resultados.
