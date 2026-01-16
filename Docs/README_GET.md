# Probar consultas GET en GraphQL — Sistema-Chifles

Este documento explica cómo probar consultas GET contra el endpoint GraphQL del servicio `GraphQL/service`.

Resumen rápido
- Endpoint GraphQL: `http://127.0.0.1:8001/graphql`
- El servicio está configurado para obtener datos del API REST mediante `GET` (los resolvers usan `rest.get(...)`).
- Actualmente el servidor bloquea métodos `POST` a `/graphql` (middleware). Las pruebas deben realizarse por GET o usando la UI GraphiQL.

Recomendaciones previas
1. Asegúrate que la API REST (Api-Rest) esté corriendo (Docker Compose) y accesible en la URL configurada en `GraphQL/service/.env` (`API_URL` normalmente `http://127.0.0.1:3000` o `http://127.0.0.1:3000/chifles`).
2. Activa el virtualenv del servicio GraphQL desde `GraphQL/service`:

```powershell
python -m venv .venv     # si no existe
& .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

3. Inicia el servidor (recomendado sin `--reload` si tienes problemas con el reloader):

```powershell
& .venv\Scripts\uvicorn.exe app.main:app --port 8001
# o en desarrollo
& .venv\Scripts\uvicorn.exe app.main:app --reload --port 8001
```

Abrir la UI (GraphiQL)
- La forma más sencilla para probar consultas: abrir GraphiQL en el navegador (el navegador pedirá `text/html` y te mostrará la UI):

```
http://127.0.0.1:8001/graphql/
```

Probar consultas GET desde PowerShell / terminal
- Nota: las consultas con variables complejas deben URL-encode; para pruebas pequeñas puedes poner la consulta literal en `?query=`.

1) GET simple (consulta literal sin variables)
```powershell
$u = 'http://127.0.0.1:8001/graphql?query={productosMasVendidos(limite:3){productoId,productoNombre,cantidadVendida}}'
Invoke-RestMethod -Uri $u -Method Get
```

2) GET con URL-encoding (operación nombrada + variables) — ejemplo robusto
```powershell
$u = 'http://127.0.0.1:8001/graphql?query=query%20Top(%24limite%3AInt)%7BproductosMasVendidos(limite%3A%24limite)%7BproductoId%2CproductoNombre%2CcantidadVendida%7D%7D&variables=%7B%22limite%22%3A3%7D'
Invoke-RestMethod -Uri $u -Method Get
```

3) Usando `curl` (Linux / WSL / curl en Windows)
```bash
curl -G --data-urlencode "query={productosMasVendidos(limite:3){productoId,productoNombre,cantidadVendida}}" "http://127.0.0.1:8001/graphql"
```

4) Usando Python + httpx (script reproducible)
```python
import httpx
q = '{productosMasVendidos(limite:3){productoId,productoNombre,cantidadVendida}}'
resp = httpx.get('http://127.0.0.1:8001/graphql', params={'query': q})
print(resp.status_code)
print(resp.text)
```

Ejemplos de consultas útiles
- `productosMasVendidos` (devuelve lista de `ProductoMasVendido` con `productoId`, `productoNombre`, `cantidadVendida`)
- `pedidosPorCliente` (ejemplo con filtros de fecha):

Query (literal):
```
{ pedidosPorCliente(clienteId:1, fechaInicio:"2025-01-01", fechaFin:"2025-12-31") { id clienteId fecha total } }
```

GET URL para `pedidosPorCliente` (PowerShell):
```powershell
$q = '{pedidosPorCliente(clienteId:1,fechaInicio:"2025-01-01",fechaFin:"2025-12-31"){id,clienteId,fecha,total}}'
Invoke-RestMethod -Uri ("http://127.0.0.1:8001/graphql?query=" + [System.Web.HttpUtility]::UrlEncode($q)) -Method Get
```

Mensajes de error comunes y cómo resolverlos
- 422 Unprocessable Entity
  - Causa habitual: la petición GET no incluye el parámetro `query` correctamente (o `variables` está mal formateado). Soluciones:
    - Usa GraphiQL en el navegador y pega la consulta.
    - Asegura que los caracteres `{ } $ , :` estén URL-encoded cuando los pones en la URL.
    - Verifica que `interface/graphql/schema.py` tiene `get_context(request: Request)` (se espera el Request como dependencia) — el proyecto ya debería tener esta corrección.

- 405 Method Not Allowed (o middleware message)
  - El servidor puede devolver 405/JSON con el mensaje "POST not allowed..." si intentas enviar POST. Usa GET o GraphiQL (el middleware se implementó para forzar solo GET según tu requisito).

Comprobaciones rápidas si no obtienes datos
- Revisa que `Api-Rest` está arriba: en `Api-Rest` ejecuta `docker compose ps` y `docker compose logs --tail 200`.
- Verifica `GraphQL/service/.env` que `API_URL` apunta al REST. En Windows, usa `127.0.0.1` para evitar problemas IPv6 con `localhost`.
- Mira los logs de uvicorn para ver tracebacks: `& .venv\Scripts\uvicorn.exe app.main:app --port 8001` mostrará errores en consola.

Pruebas automatizadas (pytest)
- El repo incluye tests que usan `respx` para mockear llamadas al REST. Para ejecutar:

```powershell
& .venv\Scripts\Activate.ps1
pip install -r requirements.txt
pytest -q
```

Notas finales y recomendaciones
- GET es apropiado para consultas de solo lectura y funciona bien para pruebas. Para consultas o variables largas es preferible POST (pero en tu caso, el requirement fue usar solo consultas GET).
- Si deseas temporalmente permitir POST para facilitar pruebas desde herramientas que no soportan GET con parámetros largos, puedo cambiar el middleware para permitir POST desde `127.0.0.1` y después revertirlo.

¿Quieres que:
- ejecute ahora `pytest` y pegue los resultados, o
- permita temporalmente POST local y haga una prueba POST para mostrar el flujo completo? 

