import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface ServerProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Componente de servidor para proteger rotas
 * Redireciona para a página de login se o usuário não estiver autenticado
 * Deve ser usado em Server Components
 */
export default async function ServerProtectedRoute({
  children,
  redirectTo = '/'
}: ServerProtectedRouteProps) {
  // Verificar a sessão no servidor
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // Se não houver sessão, redirecionar para a página de login
  if (!session) {
    redirect(redirectTo);
  }

  // Se houver sessão, renderizar o conteúdo
  return <>{children}</>;
}
