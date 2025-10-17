'use client';
import { Rss } from 'lucide-react';
import { useSession } from '@/lib/auth/auth-client';

export function FeedClient() {
  const { data: session } = useSession();
  const user = session?.user;
  
  if (!user) return null;
  
  return (
    <div className="flex flex-col">
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h2 className="text-2xl font-semibold leading-none tracking-tight">
                Seu Feed de Atualizações
              </h2>
              <p className="text-sm text-muted-foreground">
                Acompanhe as últimas atualizações e novidades
              </p>
            </div>
            
            <div className="p-6 pt-0">
              <div className="space-y-4">
                <div className="flex items-start gap-4 rounded-lg border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Rss className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Bem-vindo ao Feed!</p>
                    <p className="text-sm text-muted-foreground">
                      Aqui você verá todas as atualizações importantes do Kadernim.
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">Agora mesmo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
