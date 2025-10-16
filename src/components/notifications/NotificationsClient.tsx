// src/components/notifications/NotificationsClient.tsx
'use client'

import { useState } from 'react'
import { Bell, Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty'

interface Notification {
  id: number
  title: string
  message: string
  time: string
  read: boolean
}

export function NotificationsClient() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'Bem-vindo ao Kadernim!',
      message: 'Configure seu perfil para começar a usar todos os recursos',
      time: '5 min atrás',
      read: false,
    },
    {
      id: 2,
      title: 'Sistema atualizado',
      message: 'Nova versão disponível com melhorias de performance',
      time: '1 hora atrás',
      read: false,
    },
    {
      id: 3,
      title: 'Novo recurso adicionado',
      message: 'Confira o novo material de Matemática para o 5º ano',
      time: '2 horas atrás',
      read: true,
    },
  ])

  const handleMarkAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleDelete = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (notifications.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Empty className="py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Bell className="h-10 w-10 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>Nenhuma notificação</EmptyTitle>
            <EmptyDescription>
              Você está em dia! Não há notificações no momento.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent />
        </Empty>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? (
              <>
                {unreadCount} não lida{unreadCount > 1 ? 's' : ''}
              </>
            ) : (
              'Todas lidas'
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="text-xs"
          >
            <Check className="h-3 w-3 mr-1" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map(notification => (
          <Card
            key={notification.id}
            className={cn(
              'transition-all hover:shadow-md',
              !notification.read && 'border-l-4 border-l-primary bg-primary/5'
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm truncate">
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {notification.message}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {notification.time}
                  </span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <Check className="h-4 w-4" />
                      <span className="sr-only">Marcar como lida</span>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(notification.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Excluir</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
