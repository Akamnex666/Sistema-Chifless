Proyecto GraphQL de reportes para Sistema-Chifles

Estructura:
- app/: entrada y wiring (FastAPI + Strawberry)
- domain/: modelos Pydantic
- application/: casos de uso
- infrastructure/: cliente HTTP (httpx) y utilidades
- interface/graphql/: tipos y resolvers Strawberry
- tests/: pytest + respx

Para iniciar (desde esta carpeta):

python -m venv .venv
source.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
