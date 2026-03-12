'use client'

import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SplitUpdate, SplitUpdateSchema } from '@/schemas/billing/split-schemas'
import { toast } from 'sonner'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { SplitType } from '@db'
import { CreditCard, Percent, Banknote, ShieldCheck, Building2 } from 'lucide-react'

interface SplitConfigFormProps {
    initialData?: SplitUpdate
}

export function SplitConfigForm({ initialData }: SplitConfigFormProps) {
    const form = useForm<SplitUpdate>({
        resolver: zodResolver(SplitUpdateSchema),
        defaultValues: initialData || {
            companyName: '',
            cnpj: '',
            walletId: '',
            splitType: SplitType.PERCENTAGE,
            percentualValue: 0,
        },
    })

    // Calculations for preview
    const amount = 100 // Test value
    const type = form.watch('splitType')
    const val = form.watch('percentualValue')
    const fix = form.watch('fixedValue')

    const partnerValue = type === 'PERCENTAGE'
        ? (amount * (val || 0)) / 100
        : (fix || 0)

    const kadernimValue = amount - partnerValue

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
            toast.success('Configuração de Split atualizada com sucesso!')
        },
        onError: (error: Error) => {
            toast.error('Erro ao salvar: ' + error.message)
        },
    })

    const onSubmit = async (values: SplitUpdate) => {
        saveMutation.mutate(values)
    }

    return (
        <Card className="border-border/40 bg-card/60 shadow-xl backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Configuração de Parceiro
                </CardTitle>
                <CardDescription>
                    Defina para qual empresa e com quais regras o pagamento será dividido.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="companyName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome da Empresa</FormLabel>
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
                                            <Input placeholder="00.000.000/0001-00" {...field} />
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
                                    <FormLabel>Wallet ID (Asaas)</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center gap-2">
                                            <Input placeholder="d51008fa-..." {...field} className="font-mono text-sm" />
                                            <ShieldCheck className="h-4 w-4 text-green-500" />
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        Informe somente a carteira de destino do parceiro. A carteira principal da Kadernim deve ser cadastrada separadamente.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="rounded-2xl bg-muted/50 p-6 space-y-4 border border-border/50">
                            <h4 className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                                <CreditCard className="h-4 w-4" />
                                Regras de Divisão
                            </h4>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="splitType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo de Divisão</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
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

                                {type === 'PERCENTAGE' ? (
                                    <FormField
                                        control={form.control}
                                        name="percentualValue"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Porcentagem (%)</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            className="pl-9"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                                        />
                                                    </div>
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
                                                <FormLabel>Valor por Venda (R$)</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            className="pl-9"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>

                            {/* Advanced Preview */}
                            <div className="mt-4 pt-4 border-t border-border/50">
                                <div className="flex items-center justify-between font-medium text-sm mb-2">
                                    <span>Simulação para R$ 100,00:</span>
                                </div>
                                <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex shadow-inner">
                                    <div
                                        className="h-full bg-primary transition-all duration-500 flex items-center justify-center text-[10px] text-primary-foreground font-bold"
                                        style={{ width: `${kadernimValue}%` }}
                                    >
                                        {kadernimValue > 20 && 'Kadernim'}
                                    </div>
                                    <div
                                        className="h-full bg-indigo-500 transition-all duration-500 flex items-center justify-center text-[10px] text-white font-bold"
                                        style={{ width: `${partnerValue}%` }}
                                    >
                                        {partnerValue > 20 && 'Parceiro'}
                                    </div>
                                </div>
                                <div className="flex justify-between mt-2 text-xs font-mono">
                                    <span className="text-primary">Kadernim: R$ {kadernimValue.toFixed(2)}</span>
                                    <span className="text-indigo-400">Parceiro: R$ {partnerValue.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
                                A carteira de split nao pode ser igual a carteira principal cadastrada acima.
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-12 text-lg shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]" disabled={saveMutation.isPending}>
                            {saveMutation.isPending ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                    Salvando...
                                </div>
                            ) : 'Salvar Configuração'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
