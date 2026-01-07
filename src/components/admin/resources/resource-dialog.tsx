'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { CreateResourceSchema, UpdateResourceSchema } from '@/lib/schemas/admin/resources'
import { useCreateAdminResource, useUpdateAdminResource } from '@/hooks/use-admin-resources'
import { useResourceMeta } from '@/hooks/use-resource-meta'

interface ResourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resourceId?: string | null
  onSuccess?: () => void
}

export function ResourceDialog({ open, onOpenChange, resourceId, onSuccess }: ResourceDialogProps) {
  const isEditing = !!resourceId
  const createMutation = useCreateAdminResource()
  const updateMutation = useUpdateAdminResource(resourceId || '')
  const { data: metaData } = useResourceMeta()

  const form = useForm({
    resolver: zodResolver(isEditing ? UpdateResourceSchema : CreateResourceSchema),
    defaultValues: {
      title: '',
      description: '',
      educationLevel: '',
      subject: '',
      externalId: undefined,
      isFree: false,
      thumbUrl: '',
    },
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const onSubmit = form.handleSubmit(async data => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync(data as any)
      } else {
        // Ensure externalId is provided for creation
        const externalId = (data as any).externalId
        if (!externalId) {
          toast.error('externalId é obrigatório')
          return
        }
        await createMutation.mutateAsync({
          ...data,
          externalId,
        } as any)
      }
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar recurso')
    }
  })

  useEffect(() => {
    if (!open) {
      form.reset()
    }
  }, [open, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Recurso' : 'Novo Recurso'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Atualize os dados do recurso' : 'Preencha os dados do novo recurso'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Título do recurso"
              {...form.register('title')}
              disabled={isSubmitting}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              placeholder="Descrição do recurso"
              className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
              {...form.register('description')}
              disabled={isSubmitting}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
            )}
          </div>

          {/* Education Level */}
          <div className="space-y-2">
            <Label htmlFor="educationLevel">Nível de Educação *</Label>
            <Select
              value={form.watch('educationLevel')}
              onValueChange={value => form.setValue('educationLevel', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="educationLevel">
                <SelectValue placeholder="Selecione um nível" />
              </SelectTrigger>
              <SelectContent>
                {(metaData?.educationLevels || []).map((level) => (
                  <SelectItem key={level.key} value={level.key}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.educationLevel && (
              <p className="text-sm text-red-600">{form.formState.errors.educationLevel.message}</p>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Matéria *</Label>
            <Select
              value={form.watch('subject')}
              onValueChange={value => form.setValue('subject', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="subject">
                <SelectValue placeholder="Selecione uma matéria" />
              </SelectTrigger>
              <SelectContent>
                {(metaData?.subjects || []).map((subject) => (
                  <SelectItem key={subject.key} value={subject.key}>
                    {subject.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.subject && (
              <p className="text-sm text-red-600">{form.formState.errors.subject.message}</p>
            )}
          </div>

          {/* External ID */}
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="externalId">ID Externo *</Label>
              <Input
                id="externalId"
                type="number"
                placeholder="ID do recurso externo"
                {...form.register('externalId', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {form.formState.errors && (form.formState.errors as any).externalId && (
                <p className="text-sm text-red-600">{(form.formState.errors as any).externalId?.message}</p>
              )}
            </div>
          )}

          {/* Is Free */}
          <div className="space-y-2">
            <Label htmlFor="isFree" className="flex items-center gap-2">
              <input
                id="isFree"
                type="checkbox"
                {...form.register('isFree')}
                disabled={isSubmitting}
                className="rounded"
              />
              Recurso Gratuito
            </Label>
          </div>

          {/* Thumb URL */}
          <div className="space-y-2">
            <Label htmlFor="thumbUrl">URL da Imagem (Thumbnail)</Label>
            <Input
              id="thumbUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              {...form.register('thumbUrl')}
              disabled={isSubmitting}
            />
            {form.formState.errors.thumbUrl && (
              <p className="text-sm text-red-600">{form.formState.errors.thumbUrl.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
