import { EmailTemplateService } from '@/services/templates/email-template.service';
import {
    EmailTemplateCreateSchema,
    EmailTemplateListSchema,
} from '@/schemas/templates/email-template-schemas';
import { createTemplateCollectionHandlers } from '../templates/route-support';

export const dynamic = 'force-dynamic';

const handlers = createTemplateCollectionHandlers({
    service: EmailTemplateService,
    listSchema: EmailTemplateListSchema,
    createSchema: EmailTemplateCreateSchema,
    slugConflictMessage: 'Já existe um template com este slug',
    listErrorMessage: '[API] Erro ao listar email templates',
    createErrorMessage: '[API] Erro ao criar email template',
})

export const { GET, POST } = handlers
