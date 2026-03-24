'use client'

import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
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
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))} className="space-y-5">
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
