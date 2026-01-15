import strawberry
from typing import Any
from fastapi import Request
from .resolvers import Query


schema = strawberry.Schema(query=Query)

async def get_context(request: Request) -> dict:
    # request.app.state.rest fue inicializado en app.main
    return {'rest': request.app.state.rest}
