import pytest
import respx
from httpx import Response

from infrastructure.http_client import RESTClient
from application.usecases import ReportService


@pytest.mark.asyncio
async def test_pedidos_por_cliente_basic():
    base = 'http://testserver'
    client = RESTClient(base_url=base)
    svc = ReportService(client)

    sample_pedidos = [
        { 'id': 1, 'fecha': '2025-11-01', 'total': 100.0, 'estado': 'pagado', 'detalles': [] },
    ]

    with respx.mock(base_url=base) as rsps:
        rsps.get('/pedidos').respond(200, json=sample_pedidos)
        data = await svc.pedidos_por_cliente(1)
        assert isinstance(data, list)
        assert data[0]['id'] == 1

    await client.close()
