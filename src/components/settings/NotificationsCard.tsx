'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Bell } from 'lucide-react';

interface NotificationsCardProps {
  pushEnabled?: boolean;
  emailEnabled?: boolean;
  onUpdate?: (data: { pushEnabled: boolean; emailEnabled: boolean }) => void;
}

export function NotificationsCard({ 
  pushEnabled = true, 
  emailEnabled = true,
  onUpdate 
}: NotificationsCardProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(pushEnabled);
  const [emailNotifications, setEmailNotifications] = useState(emailEnabled);

  const handlePushToggle = (checked: boolean) => {
    setNotificationsEnabled(checked);
    if (onUpdate) {
      onUpdate({ pushEnabled: checked, emailEnabled: emailNotifications });
    }
  };

  const handleEmailToggle = (checked: boolean) => {
    setEmailNotifications(checked);
    if (onUpdate) {
      onUpdate({ pushEnabled: notificationsEnabled, emailEnabled: checked });
    }
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="border-b p-6">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Notificações</h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie como você recebe notificações
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Notificações Push</Label>
              <p className="text-sm text-muted-foreground">
                Receba notificações no navegador
              </p>
            </div>
            <Switch
              className='cursor-pointer'
              id="push-notifications"
              checked={notificationsEnabled}
              onCheckedChange={handlePushToggle}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Notificações por Email</Label>
              <p className="text-sm text-muted-foreground">
                Receba atualizações por email
              </p>
            </div>
            <Switch
              className='cursor-pointer'
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={handleEmailToggle}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
