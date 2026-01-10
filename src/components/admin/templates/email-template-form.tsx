'use client';

import React from 'react';
import { Variable } from 'lucide-react';
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
    getCategories,
    getEventVariables,
} from '@/lib/events/catalog';
import { RichTextEditor } from '@/components/admin/editor/rich-text-editor';

export interface EmailTemplateFormData {
    name: string;
    slug: string;
    subject: string;
    preheader: string;
    body: string;
    content?: any;
    eventType: string;
    description: string;
}

interface EmailTemplateFormProps {
    data: EmailTemplateFormData;
    onChange: (data: Partial<EmailTemplateFormData>) => void;
    isEditing?: boolean;
}

export function EmailTemplateForm({
    data,
    onChange,
    isEditing = false,
}: EmailTemplateFormProps) {
    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const insertVariable = (field: 'subject' | 'preheader', variable: string) => {
        const variableText = `{{${variable}}}`;
        onChange({ [field]: (data[field] || '') + variableText });
    };

    const variables = data.eventType ? getEventVariables(data.eventType) : [];

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
                            const updates: Partial<EmailTemplateFormData> = {
                                name: e.target.value,
                            };
                            if (!isEditing) updates.slug = generateSlug(e.target.value);
                            onChange(updates);
                        }}
                        placeholder="Ex: Boas-vindas ao Assinante"
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

            {/* Assunto e Preheader */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label
                            htmlFor="subject"
                            className="text-xs font-semibold text-muted-foreground"
                        >
                            Assunto do E-mail *
                        </Label>
                        {variables.length > 0 && (
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
                                <DropdownMenuContent align="end" className="w-64 max-h-[300px] overflow-y-auto">
                                    <DropdownMenuLabel className="text-xs">
                                        Inserir no Assunto
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {variables.map((variable) => (
                                        <DropdownMenuItem
                                            key={variable.key}
                                            onClick={() => insertVariable('subject', variable.key)}
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
                        )}
                    </div>
                    <Input
                        id="subject"
                        value={data.subject}
                        onChange={(e) => onChange({ subject: e.target.value })}
                        placeholder="Olá {{user.name}}, seu recurso está pronto!"
                        className="bg-muted/30"
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label
                            htmlFor="preheader"
                            className="text-xs font-semibold text-muted-foreground"
                        >
                            Preheader (Texto de apoio na inbox)
                        </Label>
                        {variables.length > 0 && (
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
                                <DropdownMenuContent align="end" className="w-64 max-h-[300px] overflow-y-auto">
                                    <DropdownMenuLabel className="text-xs">
                                        Inserir no Preheader
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {variables.map((variable) => (
                                        <DropdownMenuItem
                                            key={variable.key}
                                            onClick={() => insertVariable('preheader', variable.key)}
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
                        )}
                    </div>
                    <Input
                        id="preheader"
                        value={data.preheader}
                        onChange={(e) => onChange({ preheader: e.target.value })}
                        placeholder="Confira o novo recurso liberado na sua conta..."
                        className="bg-muted/30"
                    />
                </div>
            </div>

            {/* Corpo do E-mail */}
            <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">
                    Conteúdo do E-mail *
                </Label>
                <RichTextEditor
                    value={data.body}
                    onChange={(val) => onChange({ body: val })}
                    availableVariables={variables}
                />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">
                    Descrição Interna (Opcional)
                </Label>
                <Textarea
                    value={data.description}
                    onChange={(e) => onChange({ description: e.target.value })}
                    placeholder="Ex: Enviado após o processamento da matrícula"
                    className="min-h-[60px] bg-muted/30 text-xs"
                />
            </div>
        </div>
    );
}
