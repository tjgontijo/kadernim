'use client';
import { PageHeader } from '@/components/layout/PageHeader';
import { Home } from 'lucide-react';
import { useSession } from '@/lib/auth/auth-client';

export function DashboardClient() {
  // Middleware já garantiu que há sessão
  // Apenas buscamos os dados para exibir
  const { data: session } = useSession();
  const user = session?.user;
  
  if (!user) return null;
  
  return (
    <div className="flex flex-col">
      <PageHeader title="Dashboard" icon={<Home className="h-5 w-5" />} />
      
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h2 className="text-2xl font-semibold leading-none tracking-tight">
                Bem-vindo ao Kadernim
              </h2>
              <p className="text-sm text-muted-foreground">
                Gerencie sua conta e configurações
              </p>
            </div>
            
            <div className="p-6 pt-0">
              <div className="grid gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Nome completo</p>
                    <p className="text-sm">{user.name}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-sm">{user.email}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Status da conta</p>
                    <div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.emailVerified ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                        {user.emailVerified ? 'Email verificado' : 'Email não verificado'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">ID da conta</p>
                    <p className="font-mono text-sm">{user.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h2 className="text-xl font-semibold leading-none tracking-tight">
                Atividade recente
              </h2>
            </div>
            <div className="p-6 pt-0">
              <p className="text-sm text-muted-foreground">
                Nenhuma atividade recente para exibir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
