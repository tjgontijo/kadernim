'use client'

import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Bell,
    Gift,
    Star,
    Sparkles,
    Heart,
    Zap,
    Megaphone,
    PartyPopper,
    Lightbulb,
    BookOpen,
    Trophy,
    Flame,
    Calendar as CalendarIcon,
    X,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils/index'

// Ícones disponíveis para notificações
const NOTIFICATION_ICONS = [
    { value: 'bell', label: 'Sino', icon: Bell },
    { value: 'gift', label: 'Presente', icon: Gift },
    { value: 'star', label: 'Estrela', icon: Star },
    { value: 'sparkles', label: 'Brilhos', icon: Sparkles },
    { value: 'heart', label: 'Coração', icon: Heart },
    { value: 'zap', label: 'Raio', icon: Zap },
    { value: 'megaphone', label: 'Megafone', icon: Megaphone },
    { value: 'party', label: 'Festa', icon: PartyPopper },
    { value: 'lightbulb', label: 'Ideia', icon: Lightbulb },
    { value: 'book', label: 'Livro', icon: BookOpen },
    { value: 'trophy', label: 'Troféu', icon: Trophy },
    { value: 'flame', label: 'Destaque', icon: Flame },
]

const campaignSchema = z.object({
    title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(100),
    body: z.string().min(3, 'Mensagem deve ter pelo menos 3 caracteres').max(255),
    url: z.string().url('URL inválida').nullable().optional().or(z.literal('')),
    icon: z.string().nullable().optional(),
    imageUrl: z.string().url('URL da imagem inválida').nullable().optional().or(z.literal('')),
    scheduledAt: z.string().nullable().optional(),
    // Segmentação
    audience: z.object({
        roles: z.array(z.string()).optional(), // Array de roles selecionados
        hasSubscription: z.string().optional(), // 'all' | 'subscribers' | 'non-subscribers'
        activeInDays: z.number().nullable().optional(),
        inactiveForDays: z.number().nullable().optional(),
    }).optional(),
})

export type CampaignInput = z.infer<typeof campaignSchema>

interface CampaignFormProps {
    initialData?: Partial<CampaignInput> | null
    onSubmit: (data: CampaignInput) => void
    isLoading?: boolean
}

export function CampaignForm({ initialData, onSubmit, isLoading }: CampaignFormProps) {
    // Converter scheduledAt de ISO para formato datetime-local se existir
    const formatScheduledAt = (date: string | null | undefined) => {
        if (!date) return '';
        try {
            const d = new Date(date);
            // Formato: YYYY-MM-DDTHH:mm
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch {
            return '';
        }
    };

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        watch,
        setValue,
    } = useForm<CampaignInput>({
        resolver: zodResolver(campaignSchema),
        defaultValues: initialData ? {
            ...initialData,
            scheduledAt: formatScheduledAt((initialData as any).scheduledAt),
        } : {
            title: '',
            body: '',
            url: '',
            icon: 'bell',
            scheduledAt: '',
            audience: {
                roles: [],
                hasSubscription: 'all',
                activeInDays: null,
                inactiveForDays: null,
            },
        },
    })

    const title = watch('title')
    const body = watch('body')
    const selectedIcon = watch('icon')

    return (
        <form id="crud-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Seção: Conteúdo da Notificação */}
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <h3 className="text-sm font-semibold text-foreground mb-4">
                        Conteúdo da Notificação
                    </h3>

                    <div className="grid grid-cols-[1fr_140px] gap-4">
                        <div>
                            <Label htmlFor="title" className="mb-2 block">
                                Título
                                <span className="text-xs text-muted-foreground ml-2">
                                    ({title?.length || 0}/100)
                                </span>
                            </Label>
                            <Input
                                id="title"
                                {...register('title')}
                                placeholder="Ex: Novos recursos disponíveis!"
                                maxLength={100}
                                disabled={isLoading}
                            />
                            {errors.title && (
                                <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
                            )}
                        </div>

                        <div>
                            <Label className="mb-2 block">Ícone</Label>
                            <Controller
                                name="icon"
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue>
                                                {(() => {
                                                    const icon = NOTIFICATION_ICONS.find(
                                                        (i) => i.value === field.value
                                                    )
                                                    if (icon) {
                                                        const IconComponent = icon.icon
                                                        return (
                                                            <div className="flex items-center gap-2">
                                                                <IconComponent className="h-4 w-4" />
                                                                <span>{icon.label}</span>
                                                            </div>
                                                        )
                                                    }
                                                    return 'Selecionar'
                                                })()}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {NOTIFICATION_ICONS.map((item) => {
                                                const IconComponent = item.icon
                                                return (
                                                    <SelectItem key={item.value} value={item.value}>
                                                        <div className="flex items-center gap-2">
                                                            <IconComponent className="h-4 w-4" />
                                                            <span>{item.label}</span>
                                                        </div>
                                                    </SelectItem>
                                                )
                                            })}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="body" className="mb-2 block">
                            Mensagem
                            <span className="text-xs text-muted-foreground ml-2">
                                ({body?.length || 0}/255)
                            </span>
                        </Label>
                        <Textarea
                            id="body"
                            {...register('body')}
                            placeholder="Ex: Confira os novos planos de aula e recursos educacionais..."
                            maxLength={255}
                            rows={3}
                            disabled={isLoading}
                        />
                        {errors.body && (
                            <p className="text-xs text-destructive mt-1">{errors.body.message}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="url" className="mb-2 block">URL de Destino</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                            Abre no navegador padrão do dispositivo (fora do PWA)
                        </p>
                        <Input
                            id="url"
                            {...register('url')}
                            placeholder="https://kadernim.com.br/recursos"
                            disabled={isLoading}
                        />
                        {errors.url && (
                            <p className="text-xs text-destructive mt-1">{errors.url.message}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Seção: Segmentação */}
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <h3 className="text-sm font-semibold text-foreground mb-4">
                        Segmentação de Audiência
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Defina quais usuários receberão esta campanha. Deixe em branco para enviar para todos.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2 block">Tipo de Usuário</Label>
                            <Controller
                                name="audience.roles"
                                control={control}
                                render={({ field }) => {
                                    const selectedRoles = field.value || [];
                                    const roleOptions = [
                                        { value: 'user', label: 'Usuário comum' },
                                        { value: 'subscriber', label: 'Assinante' },
                                        { value: 'editor', label: 'Editor' },
                                        { value: 'manager', label: 'Gestor' },
                                        { value: 'admin', label: 'Admin' },
                                    ];

                                    const toggleRole = (role: string) => {
                                        const current = selectedRoles;
                                        if (current.includes(role)) {
                                            field.onChange(current.filter((r) => r !== role));
                                        } else {
                                            field.onChange([...current, role]);
                                        }
                                    };

                                    return (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full h-11 justify-start text-left font-medium"
                                                >
                                                    {selectedRoles.length === 0 ? (
                                                        <span className="text-muted-foreground">Todos os usuários</span>
                                                    ) : (
                                                        <span>
                                                            {selectedRoles.length} tipo{selectedRoles.length > 1 ? 's' : ''} selecionado{selectedRoles.length > 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[240px] p-3" align="start">
                                                <div className="space-y-2">
                                                    <p className="text-xs font-semibold text-muted-foreground mb-3">
                                                        Selecione os tipos de usuário
                                                    </p>
                                                    {roleOptions.map((option) => (
                                                        <label
                                                            key={option.value}
                                                            className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedRoles.includes(option.value)}
                                                                onChange={() => toggleRole(option.value)}
                                                                className="h-4 w-4 rounded border-gray-300"
                                                            />
                                                            <span className="text-sm">{option.label}</span>
                                                        </label>
                                                    ))}
                                                    {selectedRoles.length > 0 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="w-full mt-2"
                                                            onClick={() => field.onChange([])}
                                                        >
                                                            Limpar seleção
                                                        </Button>
                                                    )}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    );
                                }}
                            />
                        </div>

                        <div>
                            <Label className="mb-2 block">Assinatura</Label>
                            <Controller
                                name="audience.hasSubscription"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value || 'all'}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="subscribers">Assinantes</SelectItem>
                                            <SelectItem value="non-subscribers">Não assinantes</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="activeInDays" className="mb-2 block">Ativos nos últimos (dias)</Label>
                            <Controller
                                name="audience.activeInDays"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        id="activeInDays"
                                        type="number"
                                        min={1}
                                        placeholder="Deixe vazio para ignorar"
                                        value={field.value || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            field.onChange(val === '' ? null : parseInt(val));
                                        }}
                                        disabled={isLoading}
                                    />
                                )}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Opcional: Usuários que logaram recentemente
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="inactiveForDays" className="mb-2 block">Inativos há mais de (dias)</Label>
                            <Controller
                                name="audience.inactiveForDays"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        id="inactiveForDays"
                                        type="number"
                                        min={1}
                                        placeholder="Deixe vazio para ignorar"
                                        value={field.value || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            field.onChange(val === '' ? null : parseInt(val));
                                        }}
                                        disabled={isLoading}
                                    />
                                )}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Opcional: Usuários que não logam há X dias
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Seção: Agendamento */}
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <h3 className="text-sm font-semibold text-foreground mb-4">
                        Agendamento
                    </h3>

                    <div>
                        <Label className="mb-2 block">Agendar Envio</Label>
                        <Controller
                            name="scheduledAt"
                            control={control}
                            render={({ field }) => {
                                const selectedDate = field.value ? new Date(field.value) : undefined;

                                return (
                                    <div className="relative">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full h-11 justify-start text-left font-medium",
                                                        !selectedDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground/50" />
                                                    {selectedDate ? (
                                                        format(selectedDate, "PPP 'às' HH:mm", { locale: ptBR })
                                                    ) : (
                                                        <span>Selecione data e hora</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={selectedDate}
                                                    onSelect={(date) => {
                                                        if (date) {
                                                            // Manter hora atual ou definir 12:00 se for nova data
                                                            const newDate = selectedDate ? new Date(selectedDate) : new Date();
                                                            newDate.setFullYear(date.getFullYear());
                                                            newDate.setMonth(date.getMonth());
                                                            newDate.setDate(date.getDate());

                                                            field.onChange(newDate.toISOString());
                                                        }
                                                    }}
                                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                    initialFocus
                                                    locale={ptBR}
                                                />
                                                {selectedDate && (
                                                    <div className="p-3 border-t">
                                                        <Label className="text-xs mb-2 block">Horário</Label>
                                                        <Input
                                                            type="time"
                                                            value={selectedDate ? `${String(selectedDate.getHours()).padStart(2, '0')}:${String(selectedDate.getMinutes()).padStart(2, '0')}` : '12:00'}
                                                            onChange={(e) => {
                                                                if (selectedDate && e.target.value) {
                                                                    const [hours, minutes] = e.target.value.split(':');
                                                                    const newDate = new Date(selectedDate);
                                                                    newDate.setHours(parseInt(hours));
                                                                    newDate.setMinutes(parseInt(minutes));
                                                                    field.onChange(newDate.toISOString());
                                                                }
                                                            }}
                                                            className="h-9"
                                                        />
                                                    </div>
                                                )}
                                            </PopoverContent>
                                        </Popover>
                                        {selectedDate && (
                                            <button
                                                type="button"
                                                onClick={() => field.onChange('')}
                                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                );
                            }}
                        />
                    </div>
                </CardContent>
            </Card>
        </form>
    )
}
