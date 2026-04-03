import { WhatsAppTemplateUpdateSchema } from '@/lib/templates/schemas'
import { WhatsAppTemplateService } from '@/lib/templates/services'
import { createTemplateCrudHandlers } from '../../templates/route-support'

export const dynamic = 'force-dynamic'

export const { GET, PATCH, DELETE } = createTemplateCrudHandlers({
  service: WhatsAppTemplateService,
  updateSchema: WhatsAppTemplateUpdateSchema,
  notFoundLabel: 'WhatsApp template',
  slugConflictMessage: 'Já existe um template com este slug',
  deleteSuccessMessage: 'WhatsApp template excluído com sucesso',
  errorPrefix: '[API] Erro ao',
})
