import { inngest, KadernimEvents } from './client';
import { prisma } from '@/lib/db';
import {
    sendEmailFromTemplate,
    extractRecipientEmail,
    extractRecipientPhone,
    buildTemplateContext,
    renderTemplate
} from '@/services/notification/automation-email';
import { sendPushToAll, sendPushToSubscriptions } from '@/services/notification/push-send';
import { getSegmentedPushSubscriptions, type AudienceFilter } from '@/services/notification/audience-segmentation';


/**
 * Funções Inngest do Kadernim
 * 
 * Cada função aqui é um "handler" que reage a um tipo de evento.
 * O Inngest cuida de filas, retries e logs automaticamente.
 */

/**
 * Handler: Quando um código OTP é solicitado
 * 
 * - Busca templates ativos para 'auth.otp.requested'
 * - Envia via Email e/ou WhatsApp conforme configurado
 */
export const handleOtpRequested = inngest.createFunction(
    {
        id: 'handle-otp-requested',
        name: 'Enviar Código OTP',
        retries: 2, // OTP é sensível ao tempo, menos retries
    },
    { event: 'auth.otp.requested' },
    async ({ event, step }) => {
        const { email, otp, expiresIn } = event.data;

        // Buscar dados do usuário para enriquecer o contexto
        const user = await step.run('fetch-user', async () => {
            return prisma.user.findUnique({
                where: { email },
                select: { id: true, name: true, phone: true }
            });
        });

        // Montar contexto de variáveis para os templates
        const context = {
            user: {
                email,
                name: user?.name || email.split('@')[0],
                firstName: (user?.name || email.split('@')[0]).split(' ')[0],
                phone: user?.phone || '',
            },
            otp: {
                code: otp,
                expiresIn: String(expiresIn),
            },
            app: {
                name: 'Kadernim',
                url: process.env.NEXT_PUBLIC_APP_URL || 'https://kadernim.com.br',
            },
        };

        const results: Array<{ channel: string; success: boolean; error?: string }> = [];

        // Step: Enviar Email (se tiver template ativo)
        const emailResult = await step.run('send-email-otp', async () => {
            const template = await prisma.emailTemplate.findFirst({
                where: { eventType: 'auth.otp.requested', isActive: true }
            });

            if (!template) {
                console.log('[OTP] Nenhum template de email ativo para auth.otp.requested');
                return { channel: 'email', success: false, error: 'Sem template ativo' };
            }

            try {
                const result = await sendEmailFromTemplate(template.id, email, context);
                return { channel: 'email', ...result };
            } catch (err) {
                return { channel: 'email', success: false, error: String(err) };
            }
        });
        results.push(emailResult);

        // Step: Enviar WhatsApp (se tiver template ativo E usuário tiver telefone)
        if (user?.phone) {
            const whatsappResult = await step.run('send-whatsapp-otp', async () => {
                const template = await prisma.whatsAppTemplate.findFirst({
                    where: { eventType: 'auth.otp.requested', isActive: true }
                });

                if (!template) {
                    console.log('[OTP] Nenhum template de WhatsApp ativo para auth.otp.requested');
                    return { channel: 'whatsapp', success: false, error: 'Sem template ativo' };
                }

                try {
                    const renderedBody = renderTemplate(template.body, context);
                    const { sendTextMessage } = await import('@/services/whatsapp/uazapi/send-message');
                    const result = await sendTextMessage({
                        phone: user.phone!,
                        message: renderedBody
                    });
                    return { channel: 'whatsapp', success: result.status, error: result.error };
                } catch (err) {
                    return { channel: 'whatsapp', success: false, error: String(err) };
                }
            });
            results.push(whatsappResult);
        }

        const anySuccess = results.some(r => r.success);
        console.log(`[OTP] Resultado do envio para ${email}:`, results);

        return {
            processed: true,
            email,
            results,
            success: anySuccess,
        };
    }
);

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

            case 'WHATSAPP_SEND': {
                const templateId = config.templateId;
                if (!templateId) {
                    return { success: false, error: 'Template de WhatsApp não configurado' };
                }

                // Extrair telefone do destinatário do payload
                const recipientPhone = extractRecipientPhone(payload);
                if (!recipientPhone) {
                    return { success: false, error: 'Telefone do destinatário não encontrado no payload' };
                }

                // Buscar template
                const template = await prisma.whatsAppTemplate.findUnique({
                    where: { id: templateId }
                });

                if (!template) {
                    return { success: false, error: `Template de WhatsApp não encontrado: ${templateId}` };
                }

                if (!template.isActive) {
                    return { success: false, error: `Template de WhatsApp desativado: ${template.name}` };
                }

                // Montar contexto e renderizar
                const context = buildTemplateContext(payload, eventName || 'automation');
                const renderedBody = renderTemplate(template.body, context);

                console.log(`[Action] WHATSAPP_SEND para ${recipientPhone} usando template ${template.name}`);

                // Enviar via UAZAPI (ou provedor configurado)
                const { sendTextMessage } = await import('@/services/whatsapp/uazapi/send-message');
                const result = await sendTextMessage({
                    phone: recipientPhone,
                    message: renderedBody
                });

                return {
                    success: result.status,
                    error: result.error
                };
            }

            case 'PUSH_NOTIFICATION': {
                const templateId = config.templateId as string;

                // Valores padrão
                let title = config.title as string || 'Kadernim';
                let body = config.body as string || 'Nova notificação';
                let url = config.url as string || '/';
                let icon: string | undefined;
                let badge: string | undefined;
                let image: string | undefined;
                let tag = `kadernim-${eventName || 'notification'}`;

                if (templateId) {
                    // Buscar template de push (PushTemplate)
                    const template = await prisma.pushTemplate.findUnique({
                        where: { id: templateId }
                    });

                    if (template) {
                        // Renderizar variáveis do template
                        const context = buildTemplateContext(payload, eventName || 'automation');
                        title = renderTemplate(template.title, context);
                        body = renderTemplate(template.body, context);
                        url = template.url ? renderTemplate(template.url, context) : '/';
                        icon = template.icon || undefined;
                        badge = template.badge || undefined;
                        image = template.image || undefined;
                        tag = template.tag || tag;
                    }
                }

                console.log(`[Action] PUSH_NOTIFICATION: "${title}" para todas subscriptions`);

                const result = await sendPushToAll({
                    title,
                    body,
                    url,
                    icon,
                    badge,
                    image,
                    tag
                });

                return {
                    success: result.success > 0,
                    error: result.failed > 0
                        ? `${result.failed} falhas de ${result.total}`
                        : undefined
                };
            }

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
 * Handler: Quando uma campanha de push é agendada
 *
 * - Aguarda até a data de agendamento (se houver)
 * - Busca as subscrições com base nos filtros de audiência
 * - Envia o push para os usuários segmentados
 */
export const handleCampaignScheduled = inngest.createFunction(
    {
        id: 'handle-campaign-scheduled',
        name: 'Processar Campanha Agendada',
        retries: 3,
    },
    { event: 'campaign.scheduled' },
    async ({ event, step }) => {
        const { campaignId, scheduledAt } = event.data;

        // 1. Aguardar até a hora agendada (se definida e for no futuro)
        if (scheduledAt) {
            const waitTime = new Date(scheduledAt);
            if (waitTime > new Date()) {
                console.log(`[Campaign] Agendando espera até ${scheduledAt} para campanha ${campaignId}`);
                await step.sleepUntil('wait-for-schedule', waitTime);
            }
        }

        // 2. Buscar dados atualizados da campanha e audiência
        const campaign = await step.run('fetch-campaign', async () => {
            const data = await prisma.pushCampaign.findUnique({
                where: { id: campaignId }
            });

            if (!data) throw new Error(`Campanha ${campaignId} não encontrada`);
            if (data.status === 'SENT') throw new Error(`Campanha ${campaignId} já foi enviada`);

            return data;
        });

        // 3. Atualizar status para SENDING
        await step.run('update-status-sending', async () => {
            await prisma.pushCampaign.update({
                where: { id: campaignId },
                data: { status: 'SENDING' }
            });
        });

        // 4. Buscar subscriptions segmentadas baseadas no audience
        const subscriptions = await step.run('fetch-segmented-subscriptions', async () => {
            const audience = (campaign.audience as any) || {};

            console.log(`[Campaign] Aplicando segmentação:`, JSON.stringify(audience));

            // Se não tem filtros, envia para todos
            if (Object.keys(audience).length === 0 ||
                (!audience.roles?.length &&
                 !audience.hasSubscription &&
                 !audience.activeInDays &&
                 !audience.inactiveForDays)) {
                console.log(`[Campaign] Sem filtros - enviando para todas as subscriptions ativas`);
                return await prisma.pushSubscription.findMany({
                    where: { active: true },
                    select: {
                        id: true,
                        endpoint: true,
                        auth: true,
                        p256dh: true,
                        userId: true,
                    }
                });
            }

            // Aplicar filtros de segmentação
            const audienceFilter: AudienceFilter = {
                roles: audience.roles?.length > 0 ? audience.roles : undefined,
                hasSubscription: audience.hasSubscription || 'all',
                activeInDays: audience.activeInDays || null,
                inactiveForDays: audience.inactiveForDays || null,
            };

            const segmented = await getSegmentedPushSubscriptions(audienceFilter);
            console.log(`[Campaign] Filtro aplicado - ${segmented.length} subscriptions encontradas`);

            return segmented.map(s => ({
                id: s.id,
                endpoint: s.endpoint,
                auth: s.auth,
                p256dh: s.p256dh,
                userId: s.userId,
            }));
        });

        // 5. Executar o envio
        const result = await step.run('send-push-campaign', async () => {
            console.log(`[Campaign] Enviando push para ${subscriptions.length} subscriptions`);

            const sendResult = await sendPushToSubscriptions(
                subscriptions,
                {
                    title: campaign.title,
                    body: campaign.body,
                    url: campaign.url || undefined,
                    icon: campaign.icon || undefined,
                    image: campaign.imageUrl || undefined,
                    tag: `campaign-${campaign.id}`
                }
            );

            // Atualizar status e métricas
            await prisma.pushCampaign.update({
                where: { id: campaignId },
                data: {
                    status: 'SENT',
                    sentAt: new Date(),
                    totalSent: sendResult.success
                }
            });

            return sendResult;
        });

        return {
            processed: true,
            campaignId,
            sent: result.success,
            failed: result.failed,
            uniqueUsers: result.userResults.size
        };
    }
);

/**
 * Lista de todas as funções para registrar no Inngest
 */
export const functions = [
    handleOtpRequested,
    handleRequestUnfeasible,
    handleCleanupDeleted,
    handleGenericEvent,
    handleCampaignScheduled,
];

