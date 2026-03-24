'use client'

import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SplitType } from '@db'
import { toast } from 'sonner'
import { SplitUpdate, SplitUpdateSchema } from '@/schemas/billing/split-schemas'
import { applyCnpjMask } from '@/lib/utils/cpf-cnpj'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'

interface SplitConfigFormProps {
    initialData?: SplitUpdate
}

export function SplitConfigForm({ initialData }: SplitConfigFormProps) {
    const form = useForm<SplitUpdate>({
        resolver: zodResolver(SplitUpdateSchema),
        defaultValues: initialData ? {
            ...initialData,
            cnpj: applyCnpjMask(initialData.cnpj),
        } : {
            companyName: '',
            cnpj: '',
            walletId: '',
            splitType: SplitType.PERCENTAGE,
            percentualValue: 0,
        },
    })

    const simulationBase = 100
    const type = form.watch('splitType')
    const percentualValue = form.watch('percentualValue')
    const fixedValue = form.watch('fixedValue')

    const partnerValue = type === SplitType.PERCENTAGE
        ? (simulationBase * (percentualValue || 0)) / 100
        : (fixedValue || 0)
    const kadernimValue = simulationBase - partnerValue

    const saveMutation = useMutation({
        mutationFn: async (values: SplitUpdate) => {
            const response = await fetch('/api/v1/billing/split', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            })

            const payload = await response.json().catch(() => null)

            if (!response.ok) {
                throw new Error(payload?.error || 'Falha ao atualizar configuração')
            }
        },
        onSuccess: () => {
            toast.success('Configuração de split atualizada com sucesso!')
        },
        onError: (error: Error) => {
            toast.error('Erro ao salvar: ' + error.message)
        },
    })

    return (
        <Card>
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))} className="space-y-5">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="companyName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Empresa</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Empresa S.A." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="cnpj"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CNPJ</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="00.000.000/0001-00"
                                                {...field}
                                                inputMode="numeric"
                                                maxLength={18}
                                                onChange={(event) => field.onChange(applyCnpjMask(event.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="walletId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Wallet ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="d51008fa-..." {...field} className="font-mono text-sm" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="splitType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={SplitType.PERCENTAGE}>Percentual (%)</SelectItem>
                                                <SelectItem value={SplitType.FIXED}>Valor Fixo (R$)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {type === SplitType.PERCENTAGE ? (
                                <FormField
                                    control={form.control}
                                    name="percentualValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Porcentagem (%)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={field.value ?? ''}
                                                    onChange={(event) => {
                                                        const value = event.target.value
                                                        field.onChange(value === '' ? undefined : parseFloat(value))
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ) : (
                                <FormField
                                    control={form.control}
                                    name="fixedValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Valor por venda (R$)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={field.value ?? ''}
                                                    onChange={(event) => {
                                                        const value = event.target.value
                                                        field.onChange(value === '' ? undefined : parseFloat(value))
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <div className="rounded-lg border p-4">
                            <div className="text-sm font-medium">Simulação</div>
                            <div className="mt-1 text-xs text-muted-foreground">Base de R$ 100,00</div>
                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                                <div className="rounded-md border p-3">
                                    <div className="text-xs text-muted-foreground">Kadernim</div>
                                    <div className="mt-1 font-semibold">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kadernimValue)}
                                    </div>
                                </div>
                                <div className="rounded-md border p-3">
                                    <div className="text-xs text-muted-foreground">Parceiro</div>
                                    <div className="mt-1 font-semibold">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(partnerValue)}
                                    </div>
                                </div>
                            </div>
                        </div>

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
