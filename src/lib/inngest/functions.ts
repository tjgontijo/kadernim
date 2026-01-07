import { inngest, KadernimEvents } from './client';
import { prisma } from '@/lib/db';
import {
    sendEmailFromTemplate,
    extractRecipientEmail,
    buildTemplateContext
} from '@/services/notification/automation-email';

/**
 * Funções Inngest do Kadernim
 * 
 * Cada função aqui é um "handler" que reage a um tipo de evento.
 * O Inngest cuida de filas, retries e logs automaticamente.
 */

/**
 * Handler: Quando um pedido da comunidade é marcado como inviável
 * 
 * - Envia e-mail ao autor
 * - Registra log de automação
 */
export const handleRequestUnfeasible = inngest.createFunction(
    {
        id: 'handle-request-unfeasible',
        name: 'Notificar Pedido Inviável',
        retries: 3,
    },
    { event: 'community.request.unfeasible' },
    async ({ event, step }) => {
        const { requestId, title, reason, authorEmail, authorId } = event.data;

        // Step 1: Buscar regras de automação ativas para este evento
        const rules = await step.run('fetch-automation-rules', async () => {
            return prisma.automationRule.findMany({
                where: {
                    eventType: 'community.request.unfeasible',
                    isActive: true,
                },
                include: {
                    actions: true,
                },
            });
        });

        if (rules.length === 0) {
            console.log('[Automation] Nenhuma regra ativa para community.request.unfeasible');
            return { skipped: true, reason: 'No active rules' };
        }

        // Step 2: Executar cada regra
        for (const rule of rules) {
            for (const action of rule.actions) {
                await step.run(`execute-action-${action.id}`, async () => {
                    const result = await executeAction(action.type, action.config as any, {
                        requestId,
                        title,
                        reason,
                        authorEmail,
                        authorId,
                    });

                    // Logar resultado
                    await prisma.automationLog.create({
                        data: {
                            ruleId: rule.id,
                            status: result.success ? 'success' : 'failed',
                            payload: event.data as any,
                            error: result.error,
                        },
                    });

                    return result;
                });
            }
        }

        return { processed: true, rulesCount: rules.length };
    }
);

/**
 * Handler: Quando um pedido da comunidade é deletado por cleanup
 */
export const handleCleanupDeleted = inngest.createFunction(
    {
        id: 'handle-cleanup-deleted',
        name: 'Notificar Deleção por Baixo Apoio',
        retries: 3,
    },
    { event: 'community.cleanup.deleted' },
    async ({ event, step }) => {
        const { requestId, title, authorEmail, reason } = event.data;

        const rules = await step.run('fetch-rules', async () => {
            return prisma.automationRule.findMany({
                where: {
                    eventType: 'community.cleanup.deleted',
                    isActive: true,
                },
                include: { actions: true },
            });
        });

        for (const rule of rules) {
            for (const action of rule.actions) {
                await step.run(`action-${action.id}`, async () => {
                    return executeAction(action.type, action.config as any, event.data);
                });
            }
        }

        return { processed: true };
    }
);

/**
 * Handler genérico: Processa qualquer evento e busca regras correspondentes
 * 
 * Útil para eventos que ainda não têm handler específico ou seguem fluxo padrão
 */
export const handleGenericEvent = inngest.createFunction(
    {
        id: 'handle-generic-event',
        name: 'Processador de Automações',
        retries: 2,
    },
    [
        { event: 'user.signup' },
        { event: 'user.login' },
        { event: 'resource.published' },
        { event: 'lesson-plan.created' },
        { event: 'community.request.created' },
        { event: 'community.request.voted' },
        { event: 'community.request.selected' },
        { event: 'community.request.completed' },
    ],
    async ({ event, step }) => {
        const eventName = event.name as string;
        console.log(`[Inngest] Processando evento: ${eventName}`);

        // Step 1: Buscar regras de automação ativas para este evento
        const rules = await step.run('fetch-rules', async () => {
            const activeRules = await prisma.automationRule.findMany({
                where: {
                    eventType: eventName,
                    isActive: true,
                },
                include: { actions: true },
            });
            console.log(`[Inngest] Encontradas ${activeRules.length} regras ativas para ${eventName}`);
            return activeRules;
        });

        if (rules.length === 0) {
            return { skipped: true, reason: `No active rules for ${eventName}` };
        }

        const results = [];

        // Step 2: Executar cada regra e suas ações
        for (const rule of rules) {
            for (const action of rule.actions) {
                const result = await step.run(`exec-${rule.id}-${action.type}-${action.id}`, async () => {
                    console.log(`[Inngest] Executando ação ${action.type} (ID: ${action.id}) para regra ${rule.name}`);
                    const actionResult = await executeAction(action.type, action.config as any, event.data, eventName);

                    // Registrar Log no Banco
                    await prisma.automationLog.create({
                        data: {
                            ruleId: rule.id,
                            actionId: action.id,
                            status: actionResult.success ? 'success' : 'failed',
                            payload: event.data as any,
                            error: actionResult.error,
                        },
                    });

                    return actionResult;
                });
                results.push({ rule: rule.name, action: action.type, ...result });
            }
        }

        return { processed: true, event: eventName, results };
    }
);

/**
 * Executor de ações
 * 
 * Realiza a operação física (HTTP, Email, etc)
 */
async function executeAction(
    type: string,
    config: Record<string, any>,
    payload: Record<string, any>,
    eventName?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        switch (type) {
            case 'EMAIL_SEND': {
                const templateId = config.templateId;
                if (!templateId) {
                    return { success: false, error: 'Template de email não configurado' };
                }

                // Extrair email do destinatário do payload
                const recipientEmail = extractRecipientEmail(payload);
                if (!recipientEmail) {
                    return { success: false, error: 'Email do destinatário não encontrado no payload' };
                }

                // Montar contexto de variáveis
                const context = buildTemplateContext(payload, eventName || 'automation');

                console.log(`[Action] EMAIL_SEND para ${recipientEmail} usando template ${templateId}`);

                // Enviar email
                return await sendEmailFromTemplate(templateId, recipientEmail, context);
            }

            case 'PUSH_NOTIFICATION':
                // TODO: Implementar Web Push
                console.log(`[Action] PUSH_NOTIFICATION - não implementado ainda`);
                return { success: true };

            case 'WEBHOOK_CALL': {
                const url = config.url;
                if (!url) {
                    return { success: false, error: 'Webhook URL not configured' };
                }

                console.log(`[Action] WEBHOOK_CALL tentando enviar para: ${url}`);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'User-Agent': 'Kadernim-Automation-Bot'
                        },
                        body: JSON.stringify({
                            event: eventName || 'automation.triggered',
                            timestamp: new Date().toISOString(),
                            data: payload
                        }),
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error(`[Action] Webhook falhou. Status: ${response.status}`, errorText);
                        return { success: false, error: `HTTP ${response.status}: ${errorText.substring(0, 100)}` };
                    }

                    console.log(`[Action] Webhook enviado com sucesso para ${url}`);
                    return { success: true };
                } catch (fetchError) {
                    clearTimeout(timeoutId);
                    throw fetchError;
                }
            }

            default:
                console.warn(`[Action] Tipo de ação desconhecido: ${type}`);
                return { success: false, error: `Unknown action type: ${type}` };
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Action] Erro fatal ao executar ${type}:`, error);
        return { success: false, error: errorMessage };
    }
}

/**
 * Lista de todas as funções para registrar no Inngest
 */
export const functions = [
    handleRequestUnfeasible,
    handleCleanupDeleted,
    handleGenericEvent,
];

