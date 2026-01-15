"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { login, register, isLoading: authLoading } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('admin@chifles.com');
  const [password, setPassword] = useState('Admin123!');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error', err);
      const message = err?.response?.data?.message ?? err?.message ?? 'Error desconocido';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }
    
    setLoading(true);
    try {
      await register(email, password, nombre);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Register error', err);
      const message = err?.response?.data?.message ?? err?.message ?? 'Error desconocido';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">SC</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sistema Chifles</h1>
            <p className="text-sm text-gray-500">
              {isRegisterMode ? 'Crear nueva cuenta' : 'Accede con tus credenciales'}
            </p>
          </div>
        </div>

        <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-4">
          {isRegisterMode && (
            <Input 
              label="Nombre completo" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              type="text"
              placeholder="Ej: Juan Pérez"
            />
          )}
          <Input 
            label="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            type="email"
            placeholder="correo@ejemplo.com"
          />
          <Input 
            label="Contraseña" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            type="password"
            placeholder="Tu contraseña"
          />

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-2 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-600 bg-green-50 border border-green-100 p-2 rounded">
              {success}
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <Button type="submit" variant="primary" isLoading={loading}>
              {isRegisterMode ? 'Registrarse' : 'Entrar'}
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError(null);
                setSuccess(null);
              }}
            >
              {isRegisterMode ? 'Ya tengo cuenta' : 'Crear cuenta'}
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t">
          <p className="text-xs text-gray-400 mb-2">Credenciales de prueba:</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p><span className="font-medium">Email:</span> admin@chifles.com</p>
            <p><span className="font-medium">Contraseña:</span> Admin123!</p>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-400">
          <p>Auth Service en: <span className="font-mono">http://localhost:3001/docs</span></p>
        </div>
      </div>
    </div>
  );
}
