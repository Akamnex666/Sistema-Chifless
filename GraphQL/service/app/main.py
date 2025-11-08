from fastapi import FastAPI, Request
from starlette.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from strawberry.fastapi import GraphQLRouter
import os

from infrastructure.http_client import RESTClient
from interface.graphql.schema import schema, get_context


class BlockRemotePostMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Allow GET queries (for read-only) and allow POST only from localhost (for GraphiQL introspection)
        if request.method.upper() == "POST" and request.url.path.startswith("/graphql"):
            client_host = request.client.host if request.client else None
            if client_host not in ("127.0.0.1", "::1", "localhost"):
                return JSONResponse({"error": "POST to /graphql only allowed from localhost"}, status_code=405)
        return await call_next(request)


def create_app() -> FastAPI:
    app = FastAPI(title="GraphQL Reporting Service")

    # Attach REST client in app.state on startup
    @app.on_event("startup")
    async def _startup():
        # Prefer explicit API_URL env var, fallback to default
        api_url = os.getenv("API_URL") or "http://127.0.0.1:3000/chifles"
        app.state.rest = RESTClient(base_url=api_url)

    @app.on_event("shutdown")
    async def _shutdown():
        rest = getattr(app.state, "rest", None)
        if rest is not None:
            await rest.close()

    # Mount GraphQL router
    graphql_router = GraphQLRouter(schema=schema, context_getter=get_context, graphiql=True)
    app.include_router(graphql_router, prefix="/graphql")

    # Health endpoint
    @app.get("/health")
    async def _health():
        return {"status": "ok"}

    # Add middleware to restrict POST to localhost
    app.add_middleware(BlockRemotePostMiddleware)

    return app


app = create_app()
