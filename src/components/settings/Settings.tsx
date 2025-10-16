'use client';

import { useEffect, useState } from 'react';
import { ProfileCard } from './ProfileCard';
import { AppearanceCard } from './AppearanceCard';
import { NotificationsCard } from './NotificationsCard';
import { SecurityCard } from './SecurityCard';
import { UserPreferences } from '@/lib/schemas/user-preferences';

// Tipo do usuário
type UserData = {
  name: string;
  email: string;
  whatsapp?: string;
};

export function Settings() {
  const [user, setUser] = useState<UserData | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/v1/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/v1/user/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Erro ao buscar preferências:', error);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    console.log('🔄 Atualizando preferências:', updates);
    
    try {
      const response = await fetch('/api/v1/user/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      console.log('📥 Resposta:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Preferências atualizadas:', data.preferences);
        setPreferences(data.preferences);
      } else {
        const error = await response.json();
        console.error('❌ Erro na resposta:', error);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar preferências:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchPreferences();
  }, []);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <ProfileCard user={user} onUpdate={fetchUserData} />
      <AppearanceCard 
        onUpdate={(theme) => updatePreferences({ theme })}
      />
      <NotificationsCard 
        pushEnabled={preferences?.pushNotifications}
        emailEnabled={preferences?.emailNotifications}
        onUpdate={(data) => updatePreferences({
          pushNotifications: data.pushEnabled,
          emailNotifications: data.emailEnabled,
        })}
      />
      <SecurityCard />
    </div>
  );
}
