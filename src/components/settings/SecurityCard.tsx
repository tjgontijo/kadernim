'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Lock, Eye, EyeOff, LogOut } from 'lucide-react';
import { authClient } from '@/lib/auth/auth-client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

export function SecurityCard() {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
          router.push('/');
          },
        },
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleTestPush = async () => {
    try {
      const response = await fetch('/api/v1/notifications/test-push', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.message}`);
      } else {
        alert(`❌ ${data.error || 'Erro ao enviar notificação'}\n${data.message || ''}`);
      }
    } catch (error) {
      console.error('Erro ao testar push:', error);
      alert('❌ Erro ao enviar notificação de teste');
    }
  };

  const handleChangePassword = async () => {
    setError(null);
    setSuccess(false);

    // Validações
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('A nova senha deve ter no mínimo 8 caracteres');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setIsChanging(true);

    try {
      const response = await fetch('/api/v1/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao alterar senha');
      }

      setSuccess(true);
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Fechar dialog após 2 segundos
      setTimeout(() => {
        setIsChangePasswordOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar senha');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="border-b p-6">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Segurança e Privacidade</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Proteja sua conta e dados pessoais
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Alterar senha</Label>
                <p className="text-sm text-muted-foreground">
                  Atualize sua senha regularmente
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsChangePasswordOpen(true)}
              >
                Alterar
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Testar notificação push</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar uma notificação de teste
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleTestPush}
              >
                Testar
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Sair da conta</Label>
                <p className="text-sm text-muted-foreground">
                  Encerrar sua sessão neste dispositivo
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? 'Saindo...' : 'Sair'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de Alterar Senha */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
            <DialogDescription>
              Digite sua senha atual e escolha uma nova senha segura
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Senha Atual */}
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha atual</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  disabled={isChanging}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={isChanging}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  disabled={isChanging}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isChanging}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Mínimo de 8 caracteres
              </p>
            </div>

            {/* Confirmar Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  disabled={isChanging}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isChanging}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600">
                Senha alterada com sucesso!
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsChangePasswordOpen(false)}
              disabled={isChanging}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={isChanging}
            >
              {isChanging ? 'Alterando...' : 'Alterar senha'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
