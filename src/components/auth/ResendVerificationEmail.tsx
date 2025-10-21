'use client';

import { useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/auth/auth-client';

interface ResendVerificationEmailProps {
  email: string; // Email é obrigatório
  className?: string;
}

export default function ResendVerificationEmail({ email, className = '' }: ResendVerificationEmailProps) {
  // Definir o tipo de status com type para garantir a correta verificação de tipo
  type StatusType = 'idle' | 'loading' | 'success' | 'error';
  const [status, setStatus] = useState<StatusType>('idle');
  const [message, setMessage] = useState('');

  const handleResendEmail = async () => {
    if (!email) {
      setStatus('error');
      setMessage('Email não disponível.');
      return;
    }

    setStatus('loading');
    setMessage('Enviando email de verificação...');

    try {
      // Solicitar o reenvio do email de verificação
      // Usando o método correto da API conforme a documentação
      // TODO: Criar página de verificação de email
      const result = await authClient.sendVerificationEmail({
        email,
        callbackURL: `${window.location.origin}/verify-email`
      });

      if (result.error) {
        throw new Error(result.error.message || 'Falha ao enviar email de verificação');
      }

      setStatus('success');
      setMessage('Email de verificação enviado com sucesso! Verifique sua caixa de entrada.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Ocorreu um erro ao enviar o email de verificação.');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {status === 'idle' && (
        <button
          onClick={handleResendEmail}
          className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Reenviar email de verificação
        </button>
      )}
      {status === 'loading' && (
        <div className="flex items-center justify-center py-2">
          <Spinner className="w-5 h-5 text-indigo-500 mr-2" />
          <p className="text-gray-600">{message}</p>
        </div>
      )}
      {status === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{message}</p>
            </div>
          </div>
        </div>
      )}
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{message}</p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-2 text-sm text-red-600 hover:text-red-500"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
