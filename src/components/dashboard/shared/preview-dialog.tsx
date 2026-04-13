'use client'

import React from 'react'
import { Mail, Bell, MessageCircle, LinkIcon, Tag } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format } from 'date-fns'

// Types for each template variant
interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  preheader?: string | null
}



interface WhatsAppTemplate {
  id: string
  name: string
  slug: string
  body: string
  description?: string | null
}

type Template = EmailTemplate | WhatsAppTemplate

interface PreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant: 'email' | 'whatsapp'
  template: Template | null
}

export function PreviewDialog({
  open,
  onOpenChange,
  variant,
  template,
}: PreviewDialogProps) {
  if (!template) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={variant === 'email' ? 'max-w-4xl p-0 overflow-hidden rounded-2xl border-none bg-transparent' : 'max-w-md p-6 rounded-2xl'}
      >
        {variant === 'email' && <EmailPreview template={template as EmailTemplate} />}

        {variant === 'whatsapp' && <WhatsAppPreview template={template as WhatsAppTemplate} />}
      </DialogContent>
    </Dialog>
  )
}

// Email Preview Component
function EmailPreview({ template }: { template: EmailTemplate }) {
  return (
    <div className="flex flex-col h-[80vh] bg-background border rounded-2xl overflow-hidden shadow-2xl">
      <DialogHeader className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-info" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Preview do Email
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Visualização de como o cliente receberá a mensagem
              </p>
            </div>
          </div>
        </div>
      </DialogHeader>

      {/* Email Envelope View */}
      <div className="flex-1 overflow-auto bg-muted/50 p-4 md:p-8 flex justify-center">
        <div className="w-full max-w-[600px] bg-white shadow-sm border rounded-lg overflow-hidden flex flex-col h-fit min-h-full">
          {/* Meta Info */}
          <div className="p-4 border-b bg-muted/5 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase w-12 pt-0.5">
                Assunto:
              </span>
              <span className="text-sm font-medium">{template.subject}</span>
            </div>
            {template.preheader && (
              <div className="flex items-start gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase w-12 pt-0.5">
                  Preheader:
                </span>
                <span className="text-xs text-muted-foreground">
                  {template.preheader}
                </span>
              </div>
            )}
          </div>

          {/* Webview of HTML Body */}
          <div className="flex-1 bg-white">
            <iframe
              srcDoc={template.body}
              title="Email Body Preview"
              className="w-full h-full min-h-[400px] border-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
}



// WhatsApp Preview Component
function WhatsAppPreview({ template }: { template: WhatsAppTemplate }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-success" />
          Preview do WhatsApp
        </DialogTitle>
      </DialogHeader>
      <div className="mt-4">
        {/* WhatsApp Balloon Preview */}
        <div className="bg-[#e5ddd5] dark:bg-zinc-900 rounded-xl p-4 shadow-inner border relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat" />

          <div className="relative bg-white dark:bg-emerald-950 rounded-lg p-3 shadow-sm max-w-[85%] self-start border-l-4 border-success">
            <p className="text-sm whitespace-pre-wrap break-words">
              {template.body || 'Sua mensagem aparecerá aqui...'}
            </p>
            <div className="flex justify-end mt-1">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                {format(new Date(), 'HH:mm')}
                <span className="text-blue-500">✓✓</span>
              </span>
            </div>
          </div>
        </div>

        {/* Meta Info */}
        <div className="mt-4 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-bold text-muted-foreground uppercase text-[10px]">
              Slug:
            </span>
            <span className="font-mono">{template.slug}</span>
          </div>
          {template.description && (
            <div className="flex flex-col gap-1 pt-1">
              <span className="font-bold text-muted-foreground uppercase text-[10px]">
                Descrição:
              </span>
              <span>{template.description}</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
