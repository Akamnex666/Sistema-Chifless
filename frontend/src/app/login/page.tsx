"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('dev@example.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenManual, setTokenManual] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const resp = await api.post('/auth/login', { email, password });
      const token = resp.data?.access_token;
      if (!token) throw new Error('No se recibió access_token');
      localStorage.setItem('access_token', token);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error', err);
      setError(err?.response?.data?.message ?? err?.message ?? 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">SC</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sistema Chifles</h1>
            <p className="text-sm text-gray-500">Acceso de desarrollo — usa credenciales dev</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          <Input label="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button type="submit" variant="primary" isLoading={loading}>
              Entrar
            </Button>
            <a href="/api" className="text-sm text-blue-600 hover:underline">Probar en Swagger</a>
          </div>
        </form>

        <div className="mt-4 border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Pegar token (si ya lo tienes)</label>
          <div className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              value={tokenManual}
              onChange={(e) => setTokenManual(e.target.value)}
              placeholder="eyJhbGciOi..."
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (!tokenManual) return setError('Pegue un token válido');
                localStorage.setItem('access_token', tokenManual.trim());
                router.push('/dashboard');
              }}
            >
              Usar token
            </Button>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-400">
          <p>Si necesitas un token rápido, usa el endpoint <span className="font-mono">/chifles/auth/login</span> en Swagger.</p>
        </div>
      </div>
    </div>
  );
}
