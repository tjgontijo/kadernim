import { NotificationTemplateUpdateSchema } from '@/schemas/templates/notification-template-schemas'
import { NotificationTemplateService } from '@/services/templates/notification-template.service'
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
