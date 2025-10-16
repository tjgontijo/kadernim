'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Palette } from 'lucide-react';
import { useTheme } from 'next-themes';

interface AppearanceCardProps {
  onUpdate?: (theme: 'light' | 'dark' | 'system') => void;
}

export function AppearanceCard({ onUpdate }: AppearanceCardProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    if (onUpdate) {
      onUpdate(newTheme);
    }
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="border-b p-6">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Aparência</h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Personalize a aparência do sistema
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          <div>
            <Label>Tema</Label>
            {!mounted ? (
              <div className="mt-2 flex gap-2">
                <Button variant="outline" className="flex-1" disabled>
                  Claro
                </Button>
                <Button variant="outline" className="flex-1" disabled>
                  Escuro
                </Button>
                <Button variant="outline" className="flex-1" disabled>
                  Sistema
                </Button>
              </div>
            ) : (
              <div className="mt-2 flex gap-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  onClick={() => handleThemeChange('light')}
                  className="flex-1"
                >
                  Claro
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => handleThemeChange('dark')}
                  className="flex-1"
                >
                  Escuro
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  onClick={() => handleThemeChange('system')}
                  className="flex-1"
                >
                  Sistema
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
