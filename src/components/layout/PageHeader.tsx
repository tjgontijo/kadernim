// src/components/layout/PageHeader.tsx

'use client';

import { Button } from '@/components/ui/button';
import { Bell, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

interface PageHeaderProps {
  title: string;
  icon?: React.ReactNode;
  description?: string;
  backHref?: string;
  showAd?: boolean; // Controla se mostra banner premium
}

export function PageHeader({ title, icon, description, backHref }: PageHeaderProps) {
  const router = useRouter()
  const [notifications] = useState([
    {
      id: 1,
      title: 'Bem-vindo ao Kadernim!',
      message: 'Configure seu perfil para começar',
      time: '5 min atrás',
      read: false,
    },
    {
      id: 2,
      title: 'Sistema atualizado',
      message: 'Nova versão disponível',
      time: '1 hora atrás',
      read: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleBack = () => {
    if (backHref) {
      router.push(backHref)
    } else {
      router.back()
    }
  }

  return (
    <header className="flex flex-col shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {(backHref !== undefined || backHref === '') && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBack}
              className="h-9 w-9 rounded-full hover:bg-muted flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Button>
          )}
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {icon && <span className="text-muted-foreground flex-shrink-0">{icon}</span>}
              <h1 className="text-lg font-semibold truncate">{title}</h1>
            </div>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground truncate">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notificações</span>
                {unreadCount > 0 && (
                  <span className="text-xs font-normal text-muted-foreground">
                    {unreadCount} não lida{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                <>
                  {notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="flex cursor-pointer flex-col items-start gap-1 p-3"
                    >
                      <div className="flex w-full items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {notification.time}
                      </span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer justify-center text-center text-sm">
                    Ver todas as notificações
                  </DropdownMenuItem>
                </>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Nenhuma notificação
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>    
  );
}
