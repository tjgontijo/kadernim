import type {
  EmailTemplateCreate,
  EmailTemplateList,
  EmailTemplateUpdate,
  NotificationTemplateCreateInput,
  NotificationTemplateUpdateInput,
  PushTemplateCreate,
  PushTemplateList,
  PushTemplateUpdate,
  WhatsAppTemplateCreate,
  WhatsAppTemplateList,
  WhatsAppTemplateUpdate,
} from '@/lib/templates/schemas'

export type {
  EmailTemplateCreate,
  EmailTemplateList,
  EmailTemplateUpdate,
  NotificationTemplateCreateInput,
  NotificationTemplateUpdateInput,
  PushTemplateCreate,
  PushTemplateList,
  PushTemplateUpdate,
  WhatsAppTemplateCreate,
  WhatsAppTemplateList,
  WhatsAppTemplateUpdate,
}

export interface EmailTemplate {
  id: string
  slug: string
  name: string
  subject: string
  preheader: string | null
  body: string
  content?: any
  eventType: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PushTemplateRecord {
  id: string
  slug: string
  name: string
  title: string
  body: string
  icon: string | null
  badge: string | null
  image: string | null
  url: string | null
  tag: string | null
  eventType: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface WhatsAppTemplateRecord {
  id: string
  slug: string
  name: string
  body: string
  eventType: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}
