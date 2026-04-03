import {
  PushTemplateCreateSchema,
  PushTemplateListSchema,
} from '@/lib/templates/schemas'
import { PushTemplateService } from '@/lib/templates/services'
import { createTemplateCollectionHandlers } from '../templates/route-support'

export const dynamic = 'force-dynamic'

const handlers = createTemplateCollectionHandlers({
  service: PushTemplateService,
  listSchema: PushTemplateListSchema,
  createSchema: PushTemplateCreateSchema,
  slugConflictMessage: 'Já existe um template com este slug',
  listErrorMessage: '[API] Erro ao listar push templates',
  createErrorMessage: '[API] Erro ao criar push template',
})

export const { GET, POST } = handlers
