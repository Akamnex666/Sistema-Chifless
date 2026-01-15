"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Esperar a que termine de cargar el estado de autenticación
    if (isLoading) return;

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [router, isAuthenticated, isLoading]);

  // Mostrar nada mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Verificando autenticación...</div>
      </div>
    );
  }

  // Si no está autenticado, no renderizar el contenido
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
