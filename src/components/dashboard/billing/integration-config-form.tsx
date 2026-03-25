'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
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
import { ASAAS_ENVIRONMENT_VALUES, getAsaasBaseUrl } from '@/lib/billing/asaas-config'
import type { BillingAsaasSettings } from '@/schemas/billing/asaas-settings-schemas'
import type { BillingMainWalletUpdate } from '@/schemas/billing/wallet-schemas'

const FormSchema = z.object({
  environment: z.enum(ASAAS_ENVIRONMENT_VALUES),
  apiKey: z.string().trim().optional(),
  webhookToken: z.string().trim().optional(),
  mainWalletId: z.string().trim().optional(),
})

type FormValues = z.infer<typeof FormSchema>

interface IntegrationConfigFormProps {
  asaasConfig: BillingAsaasSettings
  mainWalletId: string | null
}

function PasswordField({
  id,
  label,
  placeholder,
  hasExistingValue,
  description,
  register,
}: {
  id: string
  label: string
  placeholder: string
  hasExistingValue: boolean
  description?: string
  register: React.InputHTMLAttributes<HTMLInputElement>
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={id}>{label}</Label>
        {hasExistingValue && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400">configurado</span>
        )}
      </div>
      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          placeholder={hasExistingValue ? 'Deixe em branco para manter o valor atual' : placeholder}
          className="pr-10 font-mono text-sm"
          {...register}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
          tabIndex={-1}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  )
}

export function IntegrationConfigForm({ asaasConfig, mainWalletId }: IntegrationConfigFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [environment, setEnvironment] = useState(asaasConfig.environment)

  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      environment: asaasConfig.environment,
      apiKey: '',
      webhookToken: '',
      mainWalletId: mainWalletId ?? '',
    },
  })

  const watchedEnv = watch('environment')

  async function onSubmit(values: FormValues) {
    setIsSaving(true)

    try {
      const requests: Promise<Response>[] = []

      // Always save Asaas config (environment might change)
      requests.push(
        fetch('/api/v1/billing/asaas-config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            environment: values.environment,
            apiKey: values.apiKey || undefined,
            webhookToken: values.webhookToken || undefined,
          }),
        })
      )

      // Only save wallet if user provided a value
      if (values.mainWalletId?.trim()) {
        requests.push(
          fetch('/api/v1/billing/wallet', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mainWalletId: values.mainWalletId.trim() }),
          })
        )
      }

      const responses = await Promise.all(requests)
      const errors: string[] = []

      for (const res of responses) {
        if (!res.ok) {
          const payload = await res.json().catch(() => null)
          errors.push(payload?.error || 'Erro ao salvar')
        }
      }

      if (errors.length > 0) {
        toast.error(errors.join(' · '))
        return
      }

      toast.success('Configurações salvas com sucesso')

      // Clear sensitive fields after save
      setValue('apiKey', '')
      setValue('webhookToken', '')
    } catch {
      toast.error('Falha de conexão ao salvar configurações')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Asaas Credentials */}
      <div className="space-y-5">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Asaas
          </h3>
          <p className="text-xs text-muted-foreground">
            Gateway de pagamento utilizado para cobranças e recebimentos
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="environment">Ambiente</Label>
          <Select
            value={watchedEnv}
            onValueChange={(val) => {
              setValue('environment', val as typeof ASAAS_ENVIRONMENT_VALUES[number])
              setEnvironment(val as typeof ASAAS_ENVIRONMENT_VALUES[number])
            }}
          >
            <SelectTrigger id="environment" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sandbox">Sandbox</SelectItem>
              <SelectItem value="production">Produção</SelectItem>
            </SelectContent>
          </Select>
          <p className="font-mono text-xs text-muted-foreground">
            {getAsaasBaseUrl(watchedEnv ?? environment)}
          </p>
        </div>

        <PasswordField
          id="apiKey"
          label="API Key"
          placeholder="$aact_..."
          hasExistingValue={asaasConfig.hasApiKey}
          register={register('apiKey')}
        />

        <PasswordField
          id="webhookToken"
          label="Webhook Token"
          placeholder="whsec_..."
          hasExistingValue={asaasConfig.hasWebhookToken}
          description="Token de validação dos eventos recebidos pelo webhook"
          register={register('webhookToken')}
        />
      </div>

      {/* Separator */}
      <div className="border-t" />

      {/* Wallet */}
      <div className="space-y-5">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Carteira
          </h3>
          <p className="text-xs text-muted-foreground">
            ID da carteira emissora no Asaas — necessária para splits de pagamento
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mainWalletId">Wallet ID</Label>
          <Input
            id="mainWalletId"
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="font-mono text-sm"
            {...register('mainWalletId')}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving} className="min-w-32">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando…
            </>
          ) : (
            'Salvar configurações'
          )}
        </Button>
      </div>
    </form>
  )
}
