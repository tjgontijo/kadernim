import {
    EmailTemplateCreateSchema,
    EmailTemplateListSchema,
} from '@/lib/templates/schemas';
import { EmailTemplateService } from '@/lib/templates/services';
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
