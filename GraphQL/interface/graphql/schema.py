import strawberry
from typing import Any
from fastapi import Request
from infrastructure.http_client import RESTClient
import os
from .resolvers import Query


schema = strawberry.Schema(query=Query)

async def get_context(request: Request) -> dict:
    # Extraer token del header Authorization del request del frontend
    auth_header = request.headers.get("Authorization", "")
    token = None
    
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]  # Quitar "Bearer "
    
    # Si hay token del frontend, crear un nuevo RESTClient con ese token
    # Esto permite que cada request use el token del usuario autenticado
    if token:
        api_url = os.getenv("API_URL") or "http://127.0.0.1:3000/chifles"
        rest = RESTClient(base_url=api_url, token=token)
        return {'rest': rest, 'user_token': token}
    
    # Si no hay token, usar el cliente global (que puede tener token de servicio)
    return {'rest': request.app.state.rest, 'user_token': None}
