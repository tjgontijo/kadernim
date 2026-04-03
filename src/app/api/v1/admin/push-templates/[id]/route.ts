import { PushTemplateUpdateSchema } from '@/lib/templates/schemas'
import { PushTemplateService } from '@/lib/templates/services'
import { createTemplateCrudHandlers } from '../../templates/route-support'

export const dynamic = 'force-dynamic'

export const { GET, PATCH, DELETE } = createTemplateCrudHandlers({
  service: PushTemplateService,
  updateSchema: PushTemplateUpdateSchema,
  notFoundLabel: 'Push template',
  slugConflictMessage: 'Já existe um push template com este slug',
  deleteSuccessMessage: 'Push template excluído com sucesso',
  errorPrefix: '[API] Erro ao',
})
