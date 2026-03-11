import { NextRequest, NextResponse } from 'next/server'
import {
  PushTemplateCreateSchema,
  PushTemplateListSchema,
} from '@/schemas/templates/push-template-schemas'
import { PushTemplateService } from '@/services/templates/push-template.service'
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
