import { EmailTemplateUpdateSchema } from '@/schemas/templates/email-template-schemas'
import { EmailTemplateService } from '@/services/templates/email-template.service'
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
