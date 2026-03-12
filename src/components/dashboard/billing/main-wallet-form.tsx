'use client'

import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { Wallet } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  BillingMainWalletUpdate,
  BillingMainWalletUpdateSchema,
} from '@/schemas/billing/wallet-schemas'

interface MainWalletFormProps {
  initialData: BillingMainWalletUpdate
}

export function MainWalletForm({ initialData }: MainWalletFormProps) {
  const form = useForm<BillingMainWalletUpdate>({
    resolver: zodResolver(BillingMainWalletUpdateSchema),
    defaultValues: initialData,
  })

  const saveMutation = useMutation({
    mutationFn: async (values: BillingMainWalletUpdate) => {
      const response = await fetch('/api/v1/billing/wallet', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(payload?.error || 'Falha ao atualizar carteira principal')
      }
    },
    onSuccess: () => {
      toast.success('Carteira principal atualizada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  return (
    <Card className="border-border/40 bg-card/60 shadow-xl backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          Carteira principal da Kadernim
        </CardTitle>
        <CardDescription>
          Esta carteira identifica a conta emissora no Asaas. Ela nunca pode ser usada como destino de split.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))} className="space-y-6">
            <FormField
              control={form.control}
              name="mainWalletId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wallet ID principal</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="00000000-0000-0000-0000-000000000000"
                      {...field}
                      className="font-mono text-sm"
                    />
                  </FormControl>
                  <FormDescription>
                    Cadastre aqui a carteira da propria conta da Kadernim no Asaas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Salvando...' : 'Salvar carteira principal'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
