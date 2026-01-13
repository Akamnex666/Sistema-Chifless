import httpx
import os
from typing import Any, Dict, Optional


class RESTClient:
    def __init__(self, base_url: str = 'http://127.0.0.1:3000/chifles', token: Optional[str] = None):
        self.base_url = base_url.rstrip('/')

        # Prefer explicit token param, fallback to env var
        api_token = token or os.getenv('API_TOKEN')
        headers = {}
        if api_token:
            # Default to Bearer token, adjust if your API expects a different scheme
            headers['Authorization'] = f'Bearer {api_token}'

        # Support basic auth via env vars (optional)
        basic_user = os.getenv('API_BASIC_USER')
        basic_pass = os.getenv('API_BASIC_PASS')
        auth = None
        if basic_user and basic_pass:
            auth = (basic_user, basic_pass)

        self._client = httpx.AsyncClient(base_url=self.base_url, timeout=10.0, headers=headers, auth=auth)

    async def get(self, path: str, params: Optional[Dict[str, Any]] = None) -> Any:
        resp = await self._client.get(path, params=params)
        resp.raise_for_status()
        return resp.json()

    async def post(self, path: str, json: Dict[str, Any]) -> Any:
        resp = await self._client.post(path, json=json)
        resp.raise_for_status()
        return resp.json()

    async def close(self) -> None:
        await self._client.aclose()

    async def login(self, path: str = '/auth/login', username: Optional[str] = None, password: Optional[str] = None) -> Any:
        """Attempt to login using the provided credentials. If the response contains
        a token under common keys ('access_token', 'token'), it will be applied
        to the client's Authorization header for subsequent requests.

        Many APIs return a JSON payload like {"access_token":"..."}.
        """
        payload = {}
        if username is not None and password is not None:
            # El endpoint de NestJS espera 'email' en lugar de 'username'
            payload = {'email': username, 'password': password}

        resp = await self._client.post(path, json=payload)
        resp.raise_for_status()
        body = resp.json()

        # Typical token keys
        token = None
        for key in ('access_token', 'token', 'auth_token'):
            if isinstance(body, dict) and key in body:
                token = body[key]
                break

        if token:
            # update headers on the underlying client
            self._client.headers.update({'Authorization': f'Bearer {token}'})

        return body

    def set_token(self, token: str) -> None:
        """Set Authorization header dynamically (synchronous)."""
        if token:
            self._client.headers.update({'Authorization': f'Bearer {token}'})
