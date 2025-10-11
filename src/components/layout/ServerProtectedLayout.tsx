import { ReactNode } from "react";
import ServerProtectedRoute from "../auth/ServerProtectedRoute";

interface ServerProtectedLayoutProps {
  children: ReactNode;
}

/**
 * Layout para páginas protegidas no servidor
 * Usa o ServerProtectedRoute para verificar a autenticação
 */
export default function ServerProtectedLayout({ children }: ServerProtectedLayoutProps) {
  return (
    <ServerProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* 
          Note: Como este é um componente de servidor, não podemos incluir componentes de cliente
          como o ProtectedHeader aqui. O cabeçalho teria que ser adicionado no componente filho.
        */}
        <main className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </ServerProtectedRoute>
  );
}
