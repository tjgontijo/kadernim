"use client"

import React, { useRef } from "react"
import {
    Bold, Italic, Variable, Type, Strikethrough, Code
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { EventVariable } from "@/lib/events/catalog"

interface WhatsAppEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    availableVariables?: EventVariable[]
}

export function WhatsAppEditor({ value, onChange, placeholder, availableVariables = [] }: WhatsAppEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const insertFormat = (prefix: string, suffix: string = prefix) => {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const text = textarea.value
        const selectedText = text.substring(start, end)

        const before = text.substring(0, start)
        const after = text.substring(end)

        const newValue = before + prefix + selectedText + suffix + after
        onChange(newValue)

        // Reset focus and selection
        setTimeout(() => {
            textarea.focus()
            const newCursorPos = start + prefix.length + selectedText.length + suffix.length
            textarea.setSelectionRange(newCursorPos, newCursorPos)
        }, 0)
    }

    const insertVariable = (variableKey: string) => {
        insertFormat(`{{${variableKey}}}`, "")
    }

    return (
        <div className="flex flex-col w-full border rounded-xl bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            {/* Toolbar Compacta */}
            <div className="flex items-center gap-1 p-2 bg-muted/20 border-b">
                {/* Formatação WhatsApp */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormat("*")}
                    className="h-7 w-7 p-0"
                    title="Negrito (*texto*)"
                >
                    <Bold className="h-3.5 w-3.5" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormat("_")}
                    className="h-7 w-7 p-0"
                    title="Itálico (_texto_)"
                >
                    <Italic className="h-3.5 w-3.5" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormat("~")}
                    className="h-7 w-7 p-0"
                    title="Tachado (~texto~)"
                >
                    <Strikethrough className="h-3.5 w-3.5" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormat("```", "```")}
                    className="h-7 w-7 p-0"
                    title="Monospaçado (```texto```)"
                >
                    <Code className="h-3.5 w-3.5" />
                </Button>

                <Separator orientation="vertical" className="h-5 mx-1" />

                {/* Botão de Variáveis */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-7 px-2 gap-1",
                                availableVariables.length === 0 && "opacity-50 cursor-not-allowed"
                            )}
                            disabled={availableVariables.length === 0}
                            title={availableVariables.length === 0 ? "Selecione um evento para ver as variáveis" : "Inserir variável"}
                        >
                            <Variable className="h-3.5 w-3.5" />
                            <span className="text-[10px]">Variáveis</span>
                        </Button>
                    </DropdownMenuTrigger>
                    {availableVariables.length > 0 && (
                        <DropdownMenuContent align="start" className="w-64 max-h-[400px] overflow-y-auto">
                            <DropdownMenuLabel className="text-xs">Inserir Variável</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {availableVariables.map((variable) => (
                                <DropdownMenuItem
                                    key={variable.key}
                                    onClick={() => insertVariable(variable.key)}
                                    className="flex flex-col items-start gap-1 py-2"
                                >
                                    <code className="text-xs font-mono text-primary">
                                        {`{{${variable.key}}}`}
                                    </code>
                                    <span className="text-[10px] text-muted-foreground">
                                        {variable.label}
                                        {variable.example && <span className="text-primary"> · Ex: {variable.example}</span>}
                                    </span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    )}
                </DropdownMenu>

                <div className="flex-1" />

                <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] text-emerald-600 font-medium">
                    <Type className="h-3 w-3" />
                    WHATSAPP MODE
                </div>
            </div>

            {/* Editor Container */}
            <div
                className="flex-1 cursor-text"
                onClick={() => textareaRef.current?.focus()}
            >
                <Textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder || "Escreva sua mensagem aqui..."}
                    className="min-h-[200px] w-full p-4 border-0 shadow-none focus-visible:ring-0 resize-none bg-transparent prose-sm"
                />
            </div>
        </div>
    )
}
