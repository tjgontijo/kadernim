'use client';

import Link from 'next/link';
import ProtectedHeader from '../layout/ProtectedHeader';
import ResendVerificationEmail from '../auth/ResendVerificationEmail';

// Tipo para o usuário
interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface ClientDashboardContentProps {
  user: User | undefined;
}

export default function ClientDashboardContent({ user }: ClientDashboardContentProps) {
  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <ProtectedHeader />
      <div className="max-w-3xl mx-auto mt-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard do Servidor</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Esta página é renderizada no servidor e protegida usando Server Components
            </p>
          </div>
          
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Nome completo</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{user.name}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{user.email}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Status da conta</dt>
                <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {user.emailVerified ? 'Email verificado' : 'Email não verificado'}
                  </span>
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">ID da conta</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 font-mono">{user.id}</dd>
              </div>
            </dl>
          </div>
        </div>
        
        {!user.emailVerified && (
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Verificação de Email</h2>
            <div className="mt-3 bg-white shadow overflow-hidden sm:rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100">
                  <svg className="h-4 w-4 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-yellow-800 font-medium">Seu email ainda não foi verificado</span>
              </div>
              
              <p className="text-gray-700 mb-4">
                Para verificar seu email, clique no link que enviamos para <strong>{user.email}</strong>. 
                Se você não recebeu o email ou o link expirou, você pode solicitar um novo email de verificação usando o botão abaixo.
              </p>
              
              <ResendVerificationEmail email={user.email} className="mt-4" />
            </div>
          </div>
        )}
        
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900">Comparação de Abordagens</h2>
          <div className="mt-3 bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <p className="text-gray-700 mb-4">
              Esta página usa a abordagem de Server Component com verificação de sessão no servidor.
              Compare com a abordagem de Client Component:
            </p>
            <div className="flex space-x-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Ver Dashboard Cliente
              </Link>
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Ver Perfil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
