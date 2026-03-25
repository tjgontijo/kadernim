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
import { cn } from '@/lib/utils'
import { ASAAS_ENVIRONMENT_VALUES, getAsaasBaseUrl } from '@/lib/billing/asaas-config'
import type { BillingAsaasSettings } from '@/schemas/billing/asaas-settings-schemas'

const FormSchema = z.object({
  environment: z.enum(ASAAS_ENVIRONMENT_VALUES),
  sandbox: z.object({ apiKey: z.string().optional(), webhookToken: z.string().optional() }),
  production: z.object({ apiKey: z.string().optional(), webhookToken: z.string().optional() }),
  mainWalletId: z.string().optional(),
})

type FormValues = z.infer<typeof FormSchema>

interface Props {
  asaasConfig: BillingAsaasSettings
  mainWalletId: string | null
}

function SecretInput({
  id,
  label,
  preview,
  placeholder,
  ...inputProps
}: {
  id: string
  label: string
  preview: string | null
  placeholder: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={id} className="text-sm">{label}</Label>
        {preview && (
          <span className="font-mono text-xs text-muted-foreground">{preview}</span>
        )}
      </div>
      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          placeholder={preview ? 'Nova chave (deixe vazio para manter)' : placeholder}
          autoComplete="new-password"
          className="pr-10 font-mono text-sm"
          {...inputProps}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible(v => !v)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

export function IntegrationConfigForm({ asaasConfig, mainWalletId }: Props) {
  const [isSaving, setIsSaving] = useState(false)

  const { register, handleSubmit, watch, setValue } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      environment: asaasConfig.environment,
      sandbox: { apiKey: '', webhookToken: '' },
      production: { apiKey: '', webhookToken: '' },
      mainWalletId: mainWalletId ?? '',
    },
  })

  const activeEnv = watch('environment')

  async function onSubmit(values: FormValues) {
    setIsSaving(true)
    try {
      const [configRes, walletRes] = await Promise.all([
        fetch('/api/v1/billing/asaas-config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            environment: values.environment,
            sandbox: {
              apiKey: values.sandbox.apiKey || undefined,
              webhookToken: values.sandbox.webhookToken || undefined,
            },
            production: {
              apiKey: values.production.apiKey || undefined,
              webhookToken: values.production.webhookToken || undefined,
            },
          }),
        }),
        values.mainWalletId?.trim()
          ? fetch('/api/v1/billing/wallet', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ mainWalletId: values.mainWalletId.trim() }),
            })
          : Promise.resolve(null),
      ])

      const errors: string[] = []
      if (!configRes.ok) {
        const p = await configRes.json().catch(() => null)
        errors.push(p?.error || 'Erro ao salvar configurações Asaas')
      }
      if (walletRes && !walletRes.ok) {
        const p = await walletRes.json().catch(() => null)
        errors.push(p?.error || 'Erro ao salvar carteira')
      }

      if (errors.length) {
        toast.error(errors.join(' · '))
        return
      }

      toast.success('Configurações salvas')
      setValue('sandbox.apiKey', '')
      setValue('sandbox.webhookToken', '')
      setValue('production.apiKey', '')
      setValue('production.webhookToken', '')
    } catch {
      toast.error('Falha de conexão')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

      {/* Environment toggle */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium">Ambiente ativo</p>
          <p className="text-xs text-muted-foreground">
            Determina qual conjunto de credenciais é usado nos pagamentos
          </p>
        </div>
        <div className="inline-flex rounded-lg border p-1 gap-1">
          {(['sandbox', 'production'] as const).map(env => (
            <button
              key={env}
              type="button"
              onClick={() => setValue('environment', env)}
              className={cn(
                'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                activeEnv === env
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {env === 'sandbox' ? 'Sandbox' : 'Produção'}
            </button>
          ))}
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          {getAsaasBaseUrl(activeEnv)}
        </p>
      </div>

      {/* Sandbox credentials */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Sandbox
          </p>
          {activeEnv === 'sandbox' && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              ativo
            </span>
          )}
        </div>
        <SecretInput
          id="sandbox-api-key"
          label="API Key"
          preview={asaasConfig.sandbox.apiKeyPreview}
          placeholder="$aact_hmlg_..."
          {...register('sandbox.apiKey')}
        />
        <SecretInput
          id="sandbox-webhook"
          label="Webhook Token"
          preview={asaasConfig.sandbox.webhookTokenPreview}
          placeholder="whsec_..."
          {...register('sandbox.webhookToken')}
        />
      </div>

      <div className="border-t" />

      {/* Production credentials */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Produção
          </p>
          {activeEnv === 'production' && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              ativo
            </span>
          )}
        </div>
        <SecretInput
          id="production-api-key"
          label="API Key"
          preview={asaasConfig.production.apiKeyPreview}
          placeholder="$aact_prod_..."
          {...register('production.apiKey')}
        />
        <SecretInput
          id="production-webhook"
          label="Webhook Token"
          preview={asaasConfig.production.webhookTokenPreview}
          placeholder="whsec_..."
          {...register('production.webhookToken')}
        />
      </div>

      <div className="border-t" />

      {/* Wallet */}
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Carteira
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="walletId" className="text-sm">Wallet ID</Label>
          <Input
            id="walletId"
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="font-mono text-sm"
            {...register('mainWalletId')}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving} className="min-w-36">
          {isSaving
            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando…</>
            : 'Salvar configurações'}
        </Button>
      </div>
    </form>
  )
}
