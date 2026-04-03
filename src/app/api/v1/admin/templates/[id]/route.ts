import { NotificationTemplateUpdateSchema } from '@/lib/templates/schemas'
import { NotificationTemplateService } from '@/lib/templates/services'
import { createTemplateCrudHandlers } from '../route-support'

export const dynamic = 'force-dynamic'

export const { GET, PATCH, DELETE } = createTemplateCrudHandlers({
  service: NotificationTemplateService,
  updateSchema: NotificationTemplateUpdateSchema,
  notFoundLabel: 'Template',
  slugConflictMessage: 'Já existe um template com este slug',
  deleteSuccessMessage: 'Template excluído com sucesso',
  errorPrefix: '[API] Erro ao',
})
