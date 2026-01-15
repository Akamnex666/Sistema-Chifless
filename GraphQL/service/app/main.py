from fastapi import FastAPI, Request
from starlette.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter
import os
from dotenv import load_dotenv

# Carga variables de entorno desde el .env en la raíz del servicio
root = os.path.dirname(os.path.dirname(__file__))
dotenv_path = os.path.join(root, '.env')
load_dotenv(dotenv_path=dotenv_path)

from infrastructure.http_client import RESTClient, AuthClient
from interface.graphql.schema import schema, get_context


class BlockRemotePostMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Allow GET queries (for read-only) and allow POST only from localhost (for GraphiQL introspection)
        if request.method.upper() == "POST" and request.url.path.startswith("/graphql"):
            client_host = request.client.host if request.client else None
            # Allow if coming from localhost
            if client_host in ("127.0.0.1", "::1", "localhost"):
                return await call_next(request)

            # Allow if Origin header matches the configured FRONTEND_ORIGIN (dev frontend)
            origin = request.headers.get("origin")
            frontend_origin = os.getenv("FRONTEND_ORIGIN") or "http://localhost:7171"
            allow_remote = os.getenv("ALLOW_REMOTE_POSTS", "0") == "1"
            if origin and origin == frontend_origin:
                return await call_next(request)

            # Allow if explicit env enables remote posts (dev convenience)
            if allow_remote:
                return await call_next(request)

            return JSONResponse({"error": "POST to /graphql only allowed from localhost or configured frontend origin"}, status_code=405)
        return await call_next(request)


def create_app() -> FastAPI:
    app = FastAPI(title="GraphQL Reporting Service")

    # Attach REST client in app.state on startup
    @app.on_event("startup")
    async def _startup():
        # URLs de los servicios
        api_url = os.getenv("API_URL") or "http://127.0.0.1:3000/chifles"
        auth_url = os.getenv("AUTH_SERVICE_URL") or "http://127.0.0.1:3001/api"
        
        # Crear cliente REST (sin token inicialmente)
        app.state.rest = RESTClient(base_url=api_url)
        app.state.auth = AuthClient(base_url=auth_url)
        
        # Intentar obtener token
        api_token = os.getenv("API_TOKEN")
        
        if api_token:
            # Si hay token configurado, usarlo directamente
            app.state.rest.set_token(api_token)
            print(f"✅ GraphQL Service usando token configurado en API_TOKEN")
        else:
            # Auto-login con Auth-Service
            try:
                login_email = os.getenv("API_LOGIN_EMAIL", "admin@chifles.com")
                login_password = os.getenv("API_LOGIN_PASSWORD", "Admin123!")
                
                result = await app.state.auth.login(login_email, login_password)
                
                # Extraer el access token de la respuesta del Auth-Service
                access_token = result.get('tokens', {}).get('accessToken')
                
                if access_token:
                    app.state.rest.set_token(access_token)
                    # Guardar refresh token para renovación futura
                    app.state.refresh_token = result.get('tokens', {}).get('refreshToken')
                    print(f"✅ GraphQL Service autenticado con Auth-Service ({login_email})")
                else:
                    print("⚠️ Login exitoso pero no se recibió accessToken")
                    
            except Exception as e:
                print(f"⚠️ No se pudo autenticar con Auth-Service: {e}")
                print("   Configura API_TOKEN en .env o verifica que Auth-Service esté corriendo en", auth_url)

    @app.on_event("shutdown")
    async def _shutdown():
        rest = getattr(app.state, "rest", None)
        auth = getattr(app.state, "auth", None)
        if rest is not None:
            await rest.close()
        if auth is not None:
            await auth.close()

    # Mount GraphQL router
    graphql_router = GraphQLRouter(schema=schema, context_getter=get_context, graphiql=True)
    app.include_router(graphql_router, prefix="/graphql")

    # Configure CORS so the frontend (dev server) can call /graphql
    # Allow origin via env var FRONTEND_ORIGIN for flexibility (defaults to Next dev port)
    frontend_origin = os.getenv("FRONTEND_ORIGIN") or "http://localhost:7171"
    # Support wildcard origin for quick development testing
    allow_origins = ["*"] if frontend_origin == "*" else [frontend_origin]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
    )

    # Health endpoint
    @app.get("/health")
    async def _health():
        return {"status": "ok"}

    # Add middleware to restrict POST to localhost
    app.add_middleware(BlockRemotePostMiddleware)

    return app


app = create_app()
