import type {
  EmailTemplate,
  EmailTemplateCreate,
  EmailTemplateUpdate,
  PushTemplateCreate,
  PushTemplateRecord,
  PushTemplateUpdate,
  WhatsAppTemplateCreate,
  WhatsAppTemplateRecord,
  WhatsAppTemplateUpdate,
} from '@/lib/templates/types'

async function parseResponse<T>(response: Response): Promise<T> {
  const json = await response.json().catch(() => ({}))

  if (!response.ok || (typeof json.success === 'boolean' && !json.success)) {
    throw new Error(typeof json.error === 'string' ? json.error : 'Erro na requisição')
  }

  return ('data' in json ? json.data : json) as T
}

export async function fetchEmailTemplates() {
  const response = await fetch('/api/v1/admin/email-templates')
  return parseResponse<EmailTemplate[]>(response)
}

export async function createEmailTemplate(input: EmailTemplateCreate) {
  const response = await fetch('/api/v1/admin/email-templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return parseResponse<EmailTemplate>(response)
}

export async function updateEmailTemplate(id: string, input: EmailTemplateUpdate) {
  const response = await fetch(`/api/v1/admin/email-templates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return parseResponse<EmailTemplate>(response)
}

export async function deleteEmailTemplate(id: string) {
  const response = await fetch(`/api/v1/admin/email-templates/${id}`, { method: 'DELETE' })
  return parseResponse<{ message: string }>(response)
}

export async function fetchPushTemplates() {
  const response = await fetch('/api/v1/admin/push-templates')
  return parseResponse<PushTemplateRecord[]>(response)
}

export async function createPushTemplate(input: PushTemplateCreate) {
  const response = await fetch('/api/v1/admin/push-templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return parseResponse<PushTemplateRecord>(response)
}

export async function updatePushTemplate(id: string, input: PushTemplateUpdate) {
  const response = await fetch(`/api/v1/admin/push-templates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return parseResponse<PushTemplateRecord>(response)
}

export async function deletePushTemplate(id: string) {
  const response = await fetch(`/api/v1/admin/push-templates/${id}`, { method: 'DELETE' })
  return parseResponse<{ message: string }>(response)
}

export async function fetchWhatsAppTemplates() {
  const response = await fetch('/api/v1/admin/whatsapp-templates')
  return parseResponse<WhatsAppTemplateRecord[]>(response)
}

export async function createWhatsAppTemplate(input: WhatsAppTemplateCreate) {
  const response = await fetch('/api/v1/admin/whatsapp-templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return parseResponse<WhatsAppTemplateRecord>(response)
}

export async function updateWhatsAppTemplate(id: string, input: WhatsAppTemplateUpdate) {
  const response = await fetch(`/api/v1/admin/whatsapp-templates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return parseResponse<WhatsAppTemplateRecord>(response)
}

export async function deleteWhatsAppTemplate(id: string) {
  const response = await fetch(`/api/v1/admin/whatsapp-templates/${id}`, { method: 'DELETE' })
  return parseResponse<{ message: string }>(response)
}
