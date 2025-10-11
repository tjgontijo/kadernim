'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth/auth-client';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Componente que protege rotas que requerem autenticação
 * Redireciona para a página de login se o usuário não estiver autenticado
 */
export default function ProtectedRoute({ 
  children, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    // Só verifica após o carregamento inicial da sessão
    if (!isPending) {
      if (!session || !session.user) {
        router.push(redirectTo);
      }
    }
  }, [session, isPending, router, redirectTo]);

  // Mostra um indicador de carregamento enquanto verifica a sessão
  if (isPending) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-zinc-600">Verificando autenticação...</p>
          </div>
        </div>
      </div>
    );
  }

  // Se não está carregando e tem sessão, renderiza o conteúdo da página
  if (session && session.user) {
    return <>{children}</>;
  }

  // Caso contrário, não renderiza nada (já está redirecionando)
  return null;
}
