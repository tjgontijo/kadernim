'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { getAsaasBaseUrl } from '@/lib/billing/asaas-config'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BillingAsaasSettings,
  BillingAsaasSettingsUpdate,
  BillingAsaasSettingsUpdateSchema,
} from '@/schemas/billing/asaas-settings-schemas'

interface AsaasConfigFormProps {
  initialData: BillingAsaasSettings
}

export function AsaasConfigForm({ initialData }: AsaasConfigFormProps) {
  const [status, setStatus] = useState({
    hasApiKey: initialData.hasApiKey,
    hasWebhookToken: initialData.hasWebhookToken,
  })

  const form = useForm<BillingAsaasSettingsUpdate>({
    resolver: zodResolver(BillingAsaasSettingsUpdateSchema),
    defaultValues: {
      environment: initialData.environment,
      apiKey: '',
      webhookToken: '',
    },
  })

  const environment = form.watch('environment')

  const saveMutation = useMutation({
    mutationFn: async (values: BillingAsaasSettingsUpdate) => {
      const response = await fetch('/api/v1/billing/asaas-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(payload?.error || 'Falha ao atualizar integração do Asaas')
      }

      return payload as BillingAsaasSettings
    },
    onSuccess: (payload) => {
      setStatus({
        hasApiKey: payload.hasApiKey,
        hasWebhookToken: payload.hasWebhookToken,
      })
      form.reset({
        environment: payload.environment,
        apiKey: '',
        webhookToken: '',
      })
      toast.success('Integração do Asaas atualizada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))} className="space-y-5">
            <FormField
              control={form.control}
              name="environment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ambiente</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ambiente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox</SelectItem>
                      <SelectItem value="production">Produção</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs font-mono text-muted-foreground">
                    {getAsaasBaseUrl(environment)}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={status.hasApiKey ? 'Nova chave (opcional)' : '$aact_...'}
                      {...field}
                      className="font-mono text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="webhookToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook Token</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={status.hasWebhookToken ? 'Novo token (opcional)' : 'whsec_...'}
                      {...field}
                      className="font-mono text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
