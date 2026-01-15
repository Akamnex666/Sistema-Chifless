"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AuthGate() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Esperar a que termine de cargar el estado de autenticación
    if (isLoading) return;

    // Rutas públicas donde no queremos forzar redirect
    const publicPaths = ['/', '/login', '/api', '/api-docs'];

    // Si estamos en una ruta pública
    if (publicPaths.includes(pathname || '')) {
      // Si el usuario está autenticado y está en login o home, redirigir al dashboard
      if ((pathname === '/' || pathname === '/login') && isAuthenticated) {
        router.replace('/dashboard');
      }
      return;
    }

    // Para rutas privadas, exigir autenticación
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [router, pathname, isAuthenticated, isLoading]);

  return null;
}
