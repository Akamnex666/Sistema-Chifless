import httpx
import os
from typing import Any, Dict, Optional


class AuthClient:
    """Cliente HTTP para el Auth-Service (microservicio de autenticación)."""
    
    def __init__(self, base_url: str = 'http://127.0.0.1:3001/api'):
        self.base_url = base_url.rstrip('/')
        self._client = httpx.AsyncClient(base_url=self.base_url, timeout=10.0)
    
    async def login(self, email: str, password: str) -> Dict[str, Any]:
        """Autenticar con el Auth-Service y obtener tokens JWT.
        
        Returns:
            Dict con 'user', 'tokens' (accessToken, refreshToken, etc.)
        """
        resp = await self._client.post('/auth/login', json={
            'email': email,
            'password': password
        })
        resp.raise_for_status()
        return resp.json()
    
    async def refresh(self, refresh_token: str) -> Dict[str, Any]:
        """Renovar el access token usando el refresh token."""
        resp = await self._client.post('/auth/refresh', json={
            'refreshToken': refresh_token
        })
        resp.raise_for_status()
        return resp.json()
    
    async def close(self) -> None:
        await self._client.aclose()


class RESTClient:
    """Cliente HTTP para el API REST de Sistema Chifles."""
    
    def __init__(self, base_url: str = 'http://127.0.0.1:3000/chifles', token: Optional[str] = None):
        self.base_url = base_url.rstrip('/')

        # Prefer explicit token param, fallback to env var
        api_token = token or os.getenv('API_TOKEN')
        headers = {}
        if api_token:
            headers['Authorization'] = f'Bearer {api_token}'

        self._client = httpx.AsyncClient(base_url=self.base_url, timeout=10.0, headers=headers)

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

    def set_token(self, token: str) -> None:
        """Set Authorization header dynamically."""
        if token:
            self._client.headers.update({'Authorization': f'Bearer {token}'})
