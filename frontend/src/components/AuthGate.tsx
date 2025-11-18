"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthGate() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      // Rutas públicas donde no queremos forzar redirect
      const publicPaths = ['/', '/login', '/api', '/api-docs'];

      // Si estamos en una ruta pública y hay token, enviar al dashboard
      const token = localStorage.getItem('access_token');

      // Basic token sanity checks: remove obviously invalid values
      let isInvalidToken =
        !token || token === 'null' || token === 'undefined' || token.trim() === '' || (token.split && token.split('.').length !== 3);

      // If token looks like a JWT, try to decode payload and check `exp`
      try {
        if (!isInvalidToken && token) {
          const payloadStr = token.split('.')[1];
          const decoded = JSON.parse(atob(payloadStr.replace(/-/g, '+').replace(/_/g, '/')));
          if (decoded && decoded.exp) {
            const nowSec = Math.floor(Date.now() / 1000);
            if (decoded.exp <= nowSec) {
              isInvalidToken = true; // expired
            }
          }
        }
      } catch (e) {
        // If decode fails, treat as invalid
        isInvalidToken = true;
      }

      if (isInvalidToken) {
        try {
          localStorage.removeItem('access_token');
        } catch (e) {
          // ignore
        }
      }

      if (publicPaths.includes(pathname || '')) {
        if ((pathname === '/' || pathname === '/login') && !isInvalidToken && token) {
          router.replace('/dashboard');
        }
        return;
      }

      // Para rutas privadas, exigir token válido
      if (!token || isInvalidToken) {
        router.replace('/');
      }
    } catch (e) {
      router.replace('/');
    }
  }, [router, pathname]);

  return null;
}
