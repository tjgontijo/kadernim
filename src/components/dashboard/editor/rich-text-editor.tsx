"use client"

import React from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Link } from "@tiptap/extension-link"
import { Underline } from "@tiptap/extension-underline"
import { Placeholder } from "@tiptap/extension-placeholder"
import { TextAlign } from "@tiptap/extension-text-align"
import { TaskList } from "@tiptap/extension-task-list"
import { TaskItem } from "@tiptap/extension-task-item"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableHeader } from "@tiptap/extension-table-header"
import { TableCell } from "@tiptap/extension-table-cell"
import { Strike } from "@tiptap/extension-strike"
import { Highlight } from "@tiptap/extension-highlight"
import { Typography } from "@tiptap/extension-typography"
import { Markdown } from "tiptap-markdown"
import {
    Bold, Italic, List, ListOrdered,
    Heading1, Heading2, Heading3, Undo, Redo,
    Underline as UnderlineIcon, Link2, MoreHorizontal,
    AlignLeft, AlignCenter, AlignRight, Minus, Code, 
    Quote, CheckSquare, Table as TableIcon, Strikethrough,
    Type, Highlighter, ChevronDown, Trash2, Plus, ArrowDown, ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils/index"

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: {
                    HTMLAttributes: {
                        class: "rounded-lg bg-muted p-4 font-mono text-sm my-4 bg-paper-2",
                    },
                },
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Placeholder.configure({
                placeholder: placeholder || "Comece a escrever...",
            }),
            Underline,
            Strike,
            Highlight.configure({ multicolor: true }),
            Typography,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-primary underline cursor-pointer",
                },
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Markdown.configure({
                html: false,
                transformPastedText: true,
                transformCopiedText: true,
            }),
        ],
        content: value,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            const markdown = (editor.storage as any).markdown.getMarkdown()
            onChange(markdown)
        },
        editorProps: {
            attributes: {
                class: 'outline-none focus:outline-none prose prose-sm max-w-none min-h-[300px] p-6 text-ink',
            },
        },
    })

    if (!editor) return null

    // Helper functions with safety checks
    const safeChain = () => editor.chain().focus()

    const setLink = () => {
        const url = window.prompt("URL do link:")
        if (url) {
            safeChain().setLink({ href: url }).run()
        }
    }

    return (
        <div className="flex flex-col w-full border border-line rounded-xl bg-card overflow-hidden focus-within:ring-2 focus-within:ring-terracotta/20 transition-all shadow-sm">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 p-1.5 bg-paper-2 border-b border-line">
                {/* Headers Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 px-2 hover:bg-paper font-semibold text-ink">
                            <Type className="h-4 w-4 text-terracotta" />
                            <span className="text-xs uppercase tracking-wider">Texto</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48 p-1 rounded-2 border-line bg-paper">
                        <DropdownMenuItem className="rounded-1 focus:bg-muted" onClick={() => safeChain().setParagraph().run()}>
                            Corpo de texto
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-line" />
                        <DropdownMenuItem className="rounded-1 focus:bg-muted font-bold text-lg" onClick={() => safeChain().toggleHeading({ level: 1 }).run()}>
                            Título 1
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-1 focus:bg-muted font-bold" onClick={() => safeChain().toggleHeading({ level: 2 }).run()}>
                            Título 2
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-1 focus:bg-muted font-semibold" onClick={() => safeChain().toggleHeading({ level: 3 }).run()}>
                            Título 3
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Separator orientation="vertical" className="h-5 mx-1 bg-line" />

                {/* Basic Formatting */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => safeChain().toggleBold().run()}
                    className={cn("h-8 w-8 p-0", editor.isActive("bold") && "bg-terracotta/10 text-terracotta")}
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => safeChain().toggleItalic().run()}
                    className={cn("h-8 w-8 p-0", editor.isActive("italic") && "bg-terracotta/10 text-terracotta")}
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => safeChain().toggleStrike().run()}
                    className={cn("h-8 w-8 p-0", editor.isActive("strike") && "bg-terracotta/10 text-terracotta")}
                >
                    <Strikethrough className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => safeChain().toggleHighlight().run()}
                    className={cn("h-8 w-8 p-0", editor.isActive("highlight") && "bg-terracotta/10 text-terracotta")}
                >
                    <Highlighter className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-5 mx-1 bg-line" />

                {/* Lists & Quotes */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => safeChain().toggleBulletList().run()}
                    className={cn("h-8 w-8 p-0", editor.isActive("bulletList") && "bg-terracotta/10 text-terracotta")}
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => safeChain().toggleOrderedList().run()}
                    className={cn("h-8 w-8 p-0", editor.isActive("orderedList") && "bg-terracotta/10 text-terracotta")}
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        if (typeof (editor.commands as any).toggleTaskList === 'function') {
                            safeChain().toggleTaskList().run()
                        }
                    }}
                    className={cn("h-8 w-8 p-0", editor.isActive("taskList") && "bg-terracotta/10 text-terracotta")}
                >
                    <CheckSquare className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => safeChain().toggleBlockquote().run()}
                    className={cn("h-8 w-8 p-0", editor.isActive("blockquote") && "bg-terracotta/10 text-terracotta")}
                >
                    <Quote className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-5 mx-1 bg-line" />

                {/* Inserting Elements */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={setLink}
                    className={cn("h-8 w-8 p-0", editor.isActive("link") && "bg-terracotta/10 text-terracotta")}
                >
                    <Link2 className="h-4 w-4" />
                </Button>

                {/* Table Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className={cn("h-8 gap-1 px-1.5", editor.isActive("table") && "bg-terracotta/10 text-terracotta")}
                        >
                            <TableIcon className="h-4 w-4" />
                            <ChevronDown className="h-3 w-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 p-1 rounded-2 border-line bg-paper">
                        <DropdownMenuItem 
                            className="rounded-1 focus:bg-muted" 
                            onClick={() => {
                                if (typeof (editor.commands as any).insertTable === 'function') {
                                    safeChain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                                }
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2" /> Inserir Tabela 3x3
                        </DropdownMenuItem>
                        
                        {editor.isActive('table') && (
                            <>
                                <DropdownMenuSeparator className="bg-line" />
                                <DropdownMenuItem className="rounded-1 focus:bg-muted" onClick={() => (editor.commands as any).addRowAfter?.()}>
                                    <ArrowDown className="h-4 w-4 mr-2" /> Adicionar Linha
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-1 focus:bg-muted" onClick={() => (editor.commands as any).deleteRow?.()}>
                                    <Minus className="h-4 w-4 mr-2" /> Remover Linha
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-line" />
                                <DropdownMenuItem className="rounded-1 focus:bg-muted" onClick={() => (editor.commands as any).addColumnAfter?.()}>
                                    <ArrowRight className="h-4 w-4 mr-2" /> Adicionar Coluna
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-1 focus:bg-muted" onClick={() => (editor.commands as any).deleteColumn?.()}>
                                    <Minus className="h-4 w-4 mr-2" /> Remover Coluna
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-line" />
                                <DropdownMenuItem className="rounded-1 focus:bg-berry/10 text-berry" onClick={() => (editor.commands as any).deleteTable?.()}>
                                    <Trash2 className="h-4 w-4 mr-2" /> Excluir Tabela
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => safeChain().setHorizontalRule().run()}
                    className="h-8 w-8 p-0"
                >
                    <Minus className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => safeChain().toggleCodeBlock().run()}
                    className={cn("h-8 w-8 p-0", editor.isActive("codeBlock") && "bg-terracotta/10 text-terracotta")}
                >
                    <Code className="h-4 w-4" />
                </Button>

                <div className="flex-1" />

                {/* History */}
                <div className="flex items-center gap-0.5">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => safeChain().undo().run()}
                        disabled={!editor.can().undo()}
                        className="h-8 w-8 p-0"
                    >
                        <Undo className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => safeChain().redo().run()}
                        disabled={!editor.can().redo()}
                        className="h-8 w-8 p-0"
                    >
                        <Redo className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 bg-paper min-h-[300px] cursor-text">
                <EditorContent editor={editor} />
            </div>

            <style jsx global>{`
                .prose blockquote {
                    border-left: 4px solid var(--terracotta);
                    padding-left: 1rem;
                    font-style: italic;
                    color: var(--ink-soft);
                    background: color-mix(in srgb, var(--terracotta), transparent 95%);
                    padding: 1rem;
                    border-radius: 0 0.5rem 0.5rem 0;
                }
                .prose ul[data-type="taskList"] {
                    list-style: none;
                    padding: 0;
                }
                .prose ul[data-type="taskList"] li {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.25rem;
                }
                .prose ul[data-type="taskList"] input[type="checkbox"] {
                    width: 1.1rem;
                    height: 1.1rem;
                    accent-color: var(--terracotta);
                    cursor: pointer;
                }
                .prose table {
                    border-collapse: collapse;
                    table-layout: fixed;
                    width: 100%;
                    margin: 1.5rem 0;
                    overflow: hidden;
                    border: 1px solid var(--line);
                }
                .prose table td, .prose table th {
                    min-width: 1em;
                    border: 1px solid var(--line);
                    padding: 8px 12px;
                    vertical-align: top;
                    box-sizing: border-box;
                    position: relative;
                }
                .prose table th {
                    font-weight: bold;
                    text-align: left;
                    background-color: var(--paper-2);
                }
                .prose mark {
                    background-color: #fef08a;
                    padding: 0 2px;
                    border-radius: 2px;
                }
            `}</style>
        </div>
    )
}
