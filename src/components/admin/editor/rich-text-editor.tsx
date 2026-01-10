"use client"

import React from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import Placeholder from "@tiptap/extension-placeholder"
import TextAlign from "@tiptap/extension-text-align"
import {
    Bold, Italic, List, ListOrdered,
    Heading2, Undo, Redo,
    Underline as UnderlineIcon, Link2, MoreHorizontal,
    AlignLeft, AlignCenter, AlignRight, Minus, Code, Variable
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    availableVariables?: EventVariable[]
}

export function RichTextEditor({ value, onChange, availableVariables = [] }: RichTextEditorProps) {
    const extensions = React.useMemo(() => [
        StarterKit.configure({
            codeBlock: {
                HTMLAttributes: {
                    class: "rounded-lg bg-muted p-4 font-mono text-sm my-4",
                },
            },
        }),
        Underline,
        Link.configure({
            openOnClick: false,
            HTMLAttributes: {
                class: "text-primary underline cursor-pointer",
            },
        }),
        TextAlign.configure({
            types: ["heading", "paragraph"],
        }),
        Placeholder.configure({
            placeholder: "Comece a escrever a descrição...",
        }),
    ], [])

    const editor = useEditor({
        extensions,
        content: value,
        immediatelyRender: false, // Mandatório para Next.js
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'outline-none focus:outline-none',
            },
        },
    })

    if (!editor) return null

    const setLink = () => {
        const url = window.prompt("URL do link:")
        if (url) {
            editor.chain().focus().setLink({ href: url }).run()
        }
    }

    const insertVariable = (variableKey: string) => {
        editor.chain().focus().insertContent(`{{${variableKey}}}`).run()
    }

    return (
        <div className="flex flex-col w-full border rounded-xl bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            {/* Toolbar Compacta */}
            <div className="flex items-center gap-1 p-2 bg-muted/20 border-b">
                {/* Formatação Básica */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={cn("h-7 w-7 p-0", editor.isActive("bold") && "bg-primary/10 text-primary")}
                    title="Negrito"
                >
                    <Bold className="h-3.5 w-3.5" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={cn("h-7 w-7 p-0", editor.isActive("italic") && "bg-primary/10 text-primary")}
                    title="Itálico"
                >
                    <Italic className="h-3.5 w-3.5" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={cn("h-7 w-7 p-0", editor.isActive("underline") && "bg-primary/10 text-primary")}
                    title="Sublinhado"
                >
                    <UnderlineIcon className="h-3.5 w-3.5" />
                </Button>

                <Separator orientation="vertical" className="h-5 mx-1" />

                {/* Listas */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={cn("h-7 w-7 p-0", editor.isActive("bulletList") && "bg-primary/10 text-primary")}
                    title="Lista"
                >
                    <List className="h-3.5 w-3.5" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={cn("h-7 w-7 p-0", editor.isActive("orderedList") && "bg-primary/10 text-primary")}
                    title="Lista Numerada"
                >
                    <ListOrdered className="h-3.5 w-3.5" />
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

                <Separator orientation="vertical" className="h-5 mx-1" />

                {/* Dropdown "Mais Opções" */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            title="Mais opções"
                        >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                            <Heading2 className="h-4 w-4 mr-2" />
                            Título
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.chain().focus().toggleCode().run()}>
                            <Code className="h-4 w-4 mr-2" />
                            Código
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={setLink}>
                            <Link2 className="h-4 w-4 mr-2" />
                            Inserir Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                            <Minus className="h-4 w-4 mr-2" />
                            Linha Horizontal
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign("left").run()}>
                            <AlignLeft className="h-4 w-4 mr-2" />
                            Alinhar Esquerda
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign("center").run()}>
                            <AlignCenter className="h-4 w-4 mr-2" />
                            Centralizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign("right").run()}>
                            <AlignRight className="h-4 w-4 mr-2" />
                            Alinhar Direita
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex-1" />

                {/* Undo/Redo */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="h-7 w-7 p-0"
                    title="Desfazer"
                >
                    <Undo className="h-3.5 w-3.5" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="h-7 w-7 p-0"
                    title="Refazer"
                >
                    <Redo className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Editor Container - Clicar aqui foca o editor */}
            <div
                className="flex-1 cursor-text"
                onClick={() => editor.chain().focus().run()}
            >
                <EditorContent
                    editor={editor}
                    className="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none"
                />
            </div>
        </div>
    )
}
