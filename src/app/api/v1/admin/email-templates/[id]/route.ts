import { EmailTemplateUpdateSchema } from '@/lib/templates/schemas'
import { EmailTemplateService } from '@/lib/templates/services'
import { createTemplateCrudHandlers } from '../../templates/route-support'

export const dynamic = 'force-dynamic'

export const { GET, PATCH, DELETE } = createTemplateCrudHandlers({
  service: EmailTemplateService,
  updateSchema: EmailTemplateUpdateSchema,
  notFoundLabel: 'Email template',
  slugConflictMessage: 'Já existe um template com este slug',
  deleteSuccessMessage: 'Email template excluído com sucesso',
  errorPrefix: '[API] Erro ao',
})
