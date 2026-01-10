'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { WhatsAppEditor } from '@/components/admin/editor/whatsapp-editor';
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

export interface WhatsAppTemplateFormData {
    name: string;
    slug: string;
    body: string;
    eventType: string;
    description: string;
}

interface WhatsAppTemplateFormProps {
    data: WhatsAppTemplateFormData;
    onChange: (data: Partial<WhatsAppTemplateFormData>) => void;
    isEditing?: boolean;
}

export function WhatsAppTemplateForm({
    data,
    onChange,
    isEditing = false,
}: WhatsAppTemplateFormProps) {
    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
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
                            const updates: Partial<WhatsAppTemplateFormData> = {
                                name: e.target.value,
                            };
                            if (!isEditing) updates.slug = generateSlug(e.target.value);
                            onChange(updates);
                        }}
                        placeholder="Ex: Aviso de Matrícula"
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

            {/* Mensagem WhatsApp */}
            <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">
                    Mensagem (WhatsApp) *
                </Label>
                <WhatsAppEditor
                    value={data.body}
                    onChange={(val: string) => onChange({ body: val })}
                    placeholder="Olá {{user.name}}, sua matrícula no curso {{plan.name}} foi confirmada! 🚀"
                    availableVariables={data.eventType ? getEventVariables(data.eventType) : []}
                />
                <p className="text-[10px] text-muted-foreground italic">
                    WhatsApp não suporta HTML. O editor acima usa os marcadores padrão (*negrito*, _itálico_).
                </p>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">
                    Descrição Interna (Opcional)
                </Label>
                <Textarea
                    value={data.description}
                    onChange={(e) => onChange({ description: e.target.value })}
                    placeholder="Ex: Enviado via Inngest após confirmação de pagamento"
                    className="min-h-[60px] bg-muted/30 text-xs"
                />
            </div>
        </div>
    );
}

