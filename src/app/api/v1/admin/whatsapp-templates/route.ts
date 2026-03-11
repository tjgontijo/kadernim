import { NextRequest, NextResponse } from 'next/server'
import {
  WhatsAppTemplateCreateSchema,
  WhatsAppTemplateListSchema,
} from '@/schemas/templates/whatsapp-template-schemas'
import { WhatsAppTemplateService } from '@/services/templates/whatsapp-template.service'
import { createTemplateCollectionHandlers } from '../templates/route-support'

export const dynamic = 'force-dynamic'

const handlers = createTemplateCollectionHandlers({
  service: WhatsAppTemplateService,
  listSchema: WhatsAppTemplateListSchema,
  createSchema: WhatsAppTemplateCreateSchema,
  slugConflictMessage: 'Já existe um template com este slug',
  listErrorMessage: '[API] Erro ao listar whatsapp templates',
  createErrorMessage: '[API] Erro ao criar whatsapp template',
})

export const { GET, POST } = handlers
