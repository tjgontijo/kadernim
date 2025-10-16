'use client';

import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { ProfileCard } from './ProfileCard';
import { UserPreferences } from '@/lib/schemas/user-preferences';

// Lazy load de componentes menos críticos
const AppearanceCard = lazy(() => import('./AppearanceCard').then(m => ({ default: m.AppearanceCard })));
const NotificationsCard = lazy(() => import('./NotificationsCard').then(m => ({ default: m.NotificationsCard })));
const SecurityCard = lazy(() => import('./SecurityCard').then(m => ({ default: m.SecurityCard })));

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

  const fetchUserData = useCallback(async () => {
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
  }, []);

  const fetchPreferences = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/user/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Erro ao buscar preferências:', error);
    }
  }, []);

  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    try {
      const response = await fetch('/api/v1/user/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    fetchPreferences();
  }, [fetchUserData, fetchPreferences]);

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

  const CardSkeleton = () => (
    <div className="rounded-lg border bg-card p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-muted rounded w-1/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <ProfileCard user={user} onUpdate={fetchUserData} />
      
      <Suspense fallback={<CardSkeleton />}>
        <AppearanceCard 
          onUpdate={(theme) => updatePreferences({ theme })}
        />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <NotificationsCard 
          emailEnabled={preferences?.emailNotifications}
          onUpdate={(data) => updatePreferences({
            emailNotifications: data.emailEnabled,
          })}
        />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <SecurityCard />
      </Suspense>
    </div>
  );
}
