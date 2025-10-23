'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { User, Edit } from 'lucide-react';
import { applyWhatsAppMask, denormalizeWhatsApp } from '@/lib/helpers/phone';
import { z } from 'zod';

// Schema de validação (mesmo do backend)
const profileSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo')
    .trim(),
  whatsapp: z.string()
    .transform((val) => val || '')
    .refine((val) => {
      if (!val || val.trim().length === 0) return true;
      const numbers = val.replace(/\D/g, '');
      return numbers.length >= 10 && numbers.length <= 11;
    }, {
      message: 'WhatsApp inválido. Use o formato: (DD) DDDDD-DDDD'
    })
    .optional()
});

interface ProfileCardProps {
  user: {
    name?: string;
    email?: string;
    whatsapp?: string;
  } | null;
  onUpdate?: () => void;
}

export function ProfileCard({ user, onUpdate }: ProfileCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
  });

  // Sincronizar formData quando user mudar
  useEffect(() => {
    if (user) {
      const denormalized = user.whatsapp ? denormalizeWhatsApp(user.whatsapp) : '';      
      setFormData({
        name: user.name || '',
        whatsapp: denormalized,
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Validar dados com Zod antes de enviar
      const validationResult = profileSchema.safeParse({
        name: formData.name,
        whatsapp: formData.whatsapp,
      });

      if (!validationResult.success) {
        const errors = validationResult.error.issues.map((err) => err.message).join(', ');
        setError(errors);
        setIsSaving(false);
        return;
      }

      const response = await fetch('/api/v1/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validationResult.data),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar');
      }

      // Fechar dialog
      setIsEditDialogOpen(false);
      
      // Chamar callback para recarregar dados
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  // Se não há usuário, não renderiza nada
  if (!user) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="border-b p-6">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Perfil</h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Informações da sua conta
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Nome completo</Label>
              <p className="text-base font-medium">{user?.name || 'Não informado'}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Email</Label>
              <p className="text-base font-medium">{user?.email || 'Não informado'}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">WhatsApp</Label>
              <p className="text-base font-medium">
                {user?.whatsapp ? applyWhatsAppMask(denormalizeWhatsApp(user.whatsapp)) : 'Não informado'}
              </p>
            </div>
          </div>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Editar Informações
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Perfil</DialogTitle>
                <DialogDescription>
                  Atualize suas informações pessoais
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />

                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome completo</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-whatsapp">WhatsApp</Label>
                  <Input
                    id="edit-whatsapp"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={applyWhatsAppMask(formData.whatsapp)}
                    onChange={(e) => {
                      setFormData({ ...formData, whatsapp: e.target.value.replace(/\D/g, '') });
                    }}
                  />    
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
