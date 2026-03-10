'use client';

import React from 'react';
import { Variable, ImageIcon, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    getAllEvents,
    getEventVariables,
    getCategories,
} from '@/lib/events/catalog';

export interface PushTemplateFormData {
    name: string;
    slug: string;
    title: string;
    body: string;
    icon: string;
    badge: string;
    image: string;
    url: string;
    tag: string;
    eventType: string;
    description: string;
}

interface PushTemplateFormProps {
    data: PushTemplateFormData;
    onChange: (data: Partial<PushTemplateFormData>) => void;
    isEditing?: boolean;
}

export function PushTemplateForm({
    data,
    onChange,
    isEditing = false,
}: PushTemplateFormProps) {
    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const insertVariable = (
        field: 'title' | 'body' | 'url',
        variable: string
    ) => {
        const variableText = `{{${variable}}}`;
        onChange({ [field]: ((data as any)[field] as string) + variableText });
    };

    return (
        <div className="space-y-6">
            {/* Nome e Evento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label
                        htmlFor="name"
                        className="text-xs font-semibold text-muted-foreground"
                    >
                        Nome Interno *
                    </Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => {
                            const updates: Partial<PushTemplateFormData> = {
                                name: e.target.value,
                            };
                            if (!isEditing) updates.slug = generateSlug(e.target.value);
                            onChange(updates);
                        }}
                        placeholder="Ex: Alerta de Novo Voto"
                        className="bg-muted/30"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground">
                        Evento *
                    </Label>
                    <Select
                        value={data.eventType}
                        onValueChange={(val) => onChange({ eventType: val })}
                    >
                        <SelectTrigger className="w-full bg-muted/30">
                            <SelectValue placeholder="Selecione o evento" />
                        </SelectTrigger>
                        <SelectContent>
                            {getCategories().map((category) => {
                                const events = getAllEvents().filter(
                                    (e) => e.category === category.value
                                );
                                if (events.length === 0) return null;
                                return (
                                    <React.Fragment key={category.value}>
                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                            {category.label}
                                        </div>
                                        {events.map((event) => (
                                            <SelectItem key={event.name} value={event.name}>
                                                {event.label}
                                            </SelectItem>
                                        ))}
                                    </React.Fragment>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Titulo */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label
                        htmlFor="title"
                        className="text-xs font-semibold text-muted-foreground"
                    >
                        Título da Notificação * <span className="font-normal">({data.title.length}/100)</span>
                    </Label>
                    {data.eventType && (
                        <VariableSelector
                            onSelect={(v) => insertVariable('title', v)}
                            eventType={data.eventType}
                        />
                    )}
                </div>
                <Input
                    id="title"
                    value={data.title}
                    onChange={(e) => onChange({ title: e.target.value })}
                    placeholder="{{voter.name}} votou na sua sugestão"
                    className="bg-muted/30"
                    maxLength={100}
                />
            </div>

            {/* Mensagem */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-muted-foreground">
                        Mensagem * <span className="font-normal">({data.body.length}/500)</span>
                    </Label>
                    {data.eventType && (
                        <VariableSelector
                            onSelect={(v) => insertVariable('body', v)}
                            eventType={data.eventType}
                        />
                    )}
                </div>
                <Textarea
                    value={data.body}
                    onChange={(e) => onChange({ body: e.target.value })}
                    placeholder="Sua sugestão recebeu um novo voto! Agora são {{request.voteCount}} votos."
                    className="min-h-[100px] bg-muted/30"
                    maxLength={500}
                />
            </div>

            {/* URL ao clicar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label
                        htmlFor="url"
                        className="text-xs font-semibold text-muted-foreground"
                    >
                        URL ao clicar
                    </Label>
                    {data.eventType && (
                        <VariableSelector
                            onSelect={(v) => insertVariable('url', v)}
                            eventType={data.eventType}
                        />
                    )}
                </div>
                <Input
                    id="url"
                    value={data.url}
                    onChange={(e) => onChange({ url: e.target.value })}
                    placeholder="/community/{{request.id}}"
                    className="bg-muted/30 font-mono text-sm"
                />
            </div>

            {/* Aparência */}
            <div className="space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground">
                    Aparência (opcional)
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Ícone URL
                        </Label>
                        <div className="relative">
                            <Input
                                value={data.icon}
                                onChange={(e) => onChange({ icon: e.target.value })}
                                className="pl-8 bg-muted/30 h-8 text-xs"
                                placeholder="/icons/vote.png"
                            />
                            <ImageIcon className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Badge URL
                        </Label>
                        <div className="relative">
                            <Input
                                value={data.badge}
                                onChange={(e) => onChange({ badge: e.target.value })}
                                className="pl-8 bg-muted/30 h-8 text-xs"
                                placeholder="/icons/badge.png"
                            />
                            <Tag className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Imagem Grande URL
                    </Label>
                    <div className="relative">
                        <Input
                            value={data.image}
                            onChange={(e) => onChange({ image: e.target.value })}
                            className="pl-8 bg-muted/30 h-8 text-xs"
                            placeholder="https://example.com/image.jpg"
                        />
                        <ImageIcon className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Tag (Agrupamento)
                    </Label>
                    <div className="relative">
                        <Input
                            value={data.tag}
                            onChange={(e) => onChange({ tag: e.target.value })}
                            className="pl-8 bg-muted/30 h-8 text-xs"
                            placeholder="community-vote"
                        />
                        <Tag className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">
                    Descrição Interna (Opcional)
                </Label>
                <Textarea
                    value={data.description}
                    onChange={(e) => onChange({ description: e.target.value })}
                    placeholder="Ex: Enviado para autores de pedidos quando recebem voto"
                    className="min-h-[60px] bg-muted/30 text-xs"
                />
            </div>
        </div>
    );
}

function VariableSelector({
    onSelect,
    eventType,
}: {
    onSelect: (v: string) => void;
    eventType: string;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs gap-1"
                >
                    <Variable className="h-3 w-3" />
                    Variáveis
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-64 max-h-[300px] overflow-y-auto"
            >
                <DropdownMenuLabel className="text-xs">
                    Inserir variável
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {getEventVariables(eventType).map((variable) => (
                    <DropdownMenuItem
                        key={variable.key}
                        onClick={() => onSelect(variable.key)}
                        className="flex flex-col items-start gap-1 py-2"
                    >
                        <code className="text-xs font-mono text-primary">
                            {`{{${variable.key}}}`}
                        </code>
                        <span className="text-[10px] text-muted-foreground">
                            {variable.label}
                        </span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
