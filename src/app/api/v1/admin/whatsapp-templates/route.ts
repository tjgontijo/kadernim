import {
  WhatsAppTemplateCreateSchema,
  WhatsAppTemplateListSchema,
} from '@/lib/templates/schemas'
import { WhatsAppTemplateService } from '@/lib/templates/services'
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
