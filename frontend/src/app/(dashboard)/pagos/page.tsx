'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui';

// Iconos simples
const CreditCardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-16 h-16">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

interface PaymentForm {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  amount: string;
  pedidoId: string;
}

// Componente interno que usa useSearchParams
function PagosContent() {
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cargar datos de URL si vienen del chatbot - inicializar con los valores de URL
  const initialMonto = searchParams.get('monto') || '';
  const initialPedidoId = searchParams.get('pedidoId') || '';
  
  const [formData, setFormData] = useState<PaymentForm>({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    amount: initialMonto,
    pedidoId: initialPedidoId,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Formatear número de tarjeta (XXXX XXXX XXXX XXXX)
    if (name === 'cardNumber') {
      formattedValue = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim()
        .slice(0, 19);
    }

    // Formatear fecha de expiración (MM/YY)
    if (name === 'expiryDate') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .slice(0, 5);
    }

    // CVV solo números
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    // Monto solo números y punto decimal
    if (name === 'amount') {
      formattedValue = value.replace(/[^\d.]/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const validateForm = (): boolean => {
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 16) {
      setError('Número de tarjeta inválido');
      return false;
    }
    if (!formData.cardHolder.trim()) {
      setError('Nombre del titular requerido');
      return false;
    }
    if (!formData.expiryDate || formData.expiryDate.length < 5) {
      setError('Fecha de expiración inválida');
      return false;
    }
    if (!formData.cvv || formData.cvv.length < 3) {
      setError('CVV inválido');
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Monto inválido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsProcessing(true);

    // Simular procesamiento de pago
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simular éxito (en producción, aquí iría la integración real con pasarela de pagos)
    setPaymentSuccess(true);
    setIsProcessing(false);
  };

  const resetForm = () => {
    setFormData({
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: '',
      amount: '',
      pedidoId: '',
    });
    setPaymentSuccess(false);
    setError(null);
  };

  if (paymentSuccess) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card className="p-8 text-center">
          <div className="text-green-500 flex justify-center mb-4">
            <CheckIcon />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Pago Exitoso!
          </h2>
          <p className="text-gray-600 mb-4">
            Tu pago de ${parseFloat(formData.amount).toFixed(2)} ha sido procesado correctamente.
          </p>
          {formData.pedidoId && (
            <p className="text-sm text-gray-500 mb-6">
              Pedido #{formData.pedidoId}
            </p>
          )}
          <div className="space-y-2">
            <button
              onClick={resetForm}
              className="w-full bg-amber-500 text-white py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors"
            >
              Realizar otro pago
            </button>
            <a
              href="/pedidos"
              className="block w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-center"
            >
              Ver mis pedidos
            </a>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pagos</h1>
        <p className="text-gray-600">Procesa el pago de tu pedido de forma segura</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
            <CreditCardIcon />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Información de Pago</h2>
            <p className="text-sm text-gray-500">Ingresa los datos de tu tarjeta</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto a pagar ($)
            </label>
            <input
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="0.00"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xl font-bold"
              readOnly={!!searchParams.get('monto')}
            />
          </div>

          {/* Pedido ID (si viene del chat) */}
          {formData.pedidoId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Pedido:</strong> #{formData.pedidoId}
              </p>
            </div>
          )}

          {/* Número de Tarjeta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Tarjeta
            </label>
            <input
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleInputChange}
              placeholder="1234 5678 9012 3456"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Nombre del Titular */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Titular
            </label>
            <input
              type="text"
              name="cardHolder"
              value={formData.cardHolder}
              onChange={handleInputChange}
              placeholder="JUAN PEREZ"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
            />
          </div>

          {/* Fecha y CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Expiración
              </label>
              <input
                type="text"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                placeholder="MM/YY"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                type="text"
                name="cvv"
                value={formData.cvv}
                onChange={handleInputChange}
                placeholder="123"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Botón de Pago */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-amber-500 text-white py-3 px-4 rounded-lg hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Procesando...
              </>
            ) : (
              <>
                <CreditCardIcon />
                Pagar ${formData.amount ? parseFloat(formData.amount).toFixed(2) : '0.00'}
              </>
            )}
          </button>
        </form>

        {/* Seguridad */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            Pago seguro con encriptación SSL
          </div>
        </div>
      </Card>
    </div>
  );
}

// Loading fallback para Suspense
function PagosLoading() {
  return (
    <div className="max-w-lg mx-auto p-6">
      <Card className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          <div className="space-y-3 mt-6">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Componente principal con Suspense boundary
export default function PagosPage() {
  return (
    <Suspense fallback={<PagosLoading />}>
      <PagosContent />
    </Suspense>
  );
}
