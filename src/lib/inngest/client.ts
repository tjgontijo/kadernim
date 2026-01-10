import { Inngest } from 'inngest';

/**
 * Cliente Inngest para o Kadernim
 * 
 * Este cliente é usado para emitir eventos e definir funções que reagem a eles.
 * Documentação: https://www.inngest.com/docs
 */
export const inngest = new Inngest({
    id: 'kadernim',
    // O nome aparece no dashboard do Inngest
    name: 'Kadernim Automation',
});

/**
 * Tipos de eventos suportados pelo sistema
 * 
 * Adicione novos eventos aqui conforme forem necessários
 */
export type KadernimEvents = {
    // Eventos de Autenticação
    'auth.otp.requested': {
        data: {
            email: string;
            otp: string;
            expiresIn: number; // minutos
        };
    };

    // Eventos de Comunidade
    'community.request.created': {
        data: {
            requestId: string;
            userId: string;
            title: string;
            description: string;
        };
    };
    'community.request.voted': {
        data: {
            requestId: string;
            voterId: string;
            voteType: 'up' | 'down';
            currentVotes: number;
        };
    };
    'community.request.selected': {
        data: {
            requestId: string;
            title: string;
            authorId: string;
            authorEmail: string;
        };
    };
    'community.request.completed': {
        data: {
            requestId: string;
            resourceId: string;
            title: string;
            authorId: string;
        };
    };
    'community.request.unfeasible': {
        data: {
            requestId: string;
            title: string;
            reason: string;
            authorId: string;
            authorEmail: string;
        };
    };
    'community.cleanup.deleted': {
        data: {
            requestId: string;
            title: string;
            authorId: string;
            authorEmail: string;
            reason: string;
        };
    };

    // Eventos de Usuário
    'user.signup': {
        data: {
            userId: string;
            email: string;
            name: string;
        };
    };
    'user.login': {
        data: {
            userId: string;
            email: string;
            method: string;
        };
    };
    'user.subscription.created': {
        data: {
            userId: string;
            planId: string;
            planName: string;
        };
    };
    'user.subscription.trial_ending': {
        data: {
            userId: string;
            email: string;
            daysRemaining: number;
        };
    };
    'user.resource.access_granted': {
        data: {
            userId: string;
            email: string;
            resourceIds: string[];
            source: string; // ex: 'yampi:product_123'
        };
    };

    // Eventos de Recursos
    'resource.created': {
        data: {
            resourceId: string;
            title: string;
            educationLevel: string;
            subject: string;
            createdBy: string;
        };
    };
    'resource.published': {
        data: {
            resourceId: string;
            title: string;
            authorId: string;
            categorySlug: string;
        };
    };

    // Eventos de Plano de Aula
    'lesson-plan.created': {
        data: {
            lessonPlanId: string;
            userId: string;
            title: string;
            subject: string;
            grade: string;
        };
    };

    // Eventos de Campanha
    'campaign.scheduled': {
        data: {
            campaignId: string;
            scheduledAt?: string; // ISO string
        };
    };
};

/**
 * Helper para emitir eventos de forma tipada
 * 
 * @example
 * await emitEvent('community.request.created', {
 *   requestId: '123',
 *   userId: 'user_456',
 *   title: 'Novo pedido',
 *   description: 'Descrição...'
 * });
 */
export async function emitEvent<K extends keyof KadernimEvents>(
    eventName: K,
    data: KadernimEvents[K]['data']
) {
    try {
        await inngest.send({
            name: eventName,
            data,
        });
        console.log(`[Inngest] Evento emitido: ${eventName}`);
    } catch (error) {
        // Nunca quebrar a operação principal por falha no evento
        console.error(`[Inngest] Erro ao emitir evento ${eventName}:`, error);
    }
}
