/**
 * Catálogo de Eventos do Kadernim
 * 
 * Este arquivo centraliza TODOS os eventos do sistema que podem disparar notificações.
 * 
 * IMPORTANTE: Ao adicionar um novo caso de uso:
 * 1. Adicione o evento aqui com seu schema
 * 2. Emita o evento no código usando emitEvent()
 * 3. Admin poderá criar templates e automações na UI
 */

export interface EventVariable {
    key: string;
    label: string;
    description?: string;
    example?: string;
}

export interface EventSchema {
    /** Nome único do evento (ex: 'user.login') */
    name: string;

    /** Label amigável para exibir na UI */
    label: string;

    /** Categoria para agrupamento */
    category: 'user' | 'resource' | 'subscription' | 'lesson_plan' | 'community' | 'payment';

    /** Descrição do que dispara este evento */
    description: string;

    /** Variáveis disponíveis para templates */
    variables: EventVariable[];

    /** Exemplo de payload (para preview e testes) */
    examplePayload: Record<string, any>;
}

// ═══════════════════════════════════════════════════════════════
// CATÁLOGO DE EVENTOS
// ═══════════════════════════════════════════════════════════════

export const EVENT_CATALOG: Record<string, EventSchema> = {
    // ═══════════════════════════════════════════════════════════════
    // CATEGORIA: USUÁRIO
    // ═══════════════════════════════════════════════════════════════
    'user.signup': {
        name: 'user.signup',
        label: 'Cadastro de Usuário',
        category: 'user',
        description: 'Disparado quando um novo usuário se cadastra no sistema',
        variables: [
            { key: 'user.name', label: 'Nome completo', example: 'Maria Silva' },
            { key: 'user.firstName', label: 'Primeiro nome', example: 'Maria' },
            { key: 'user.email', label: 'Email', example: 'maria@escola.com' },
            { key: 'event.date', label: 'Data do evento', example: '06/01/2026' },
            { key: 'event.time', label: 'Hora do evento', example: '20:08' },
            { key: 'app.name', label: 'Nome do app', example: 'Kadernim' },
            { key: 'app.url', label: 'URL do app', example: 'https://kadernim.com.br' },
        ],
        examplePayload: {
            user: { id: 'usr_123', name: 'Maria Silva', email: 'maria@escola.com' },
        },
    },

    'user.login': {
        name: 'user.login',
        label: 'Login de Usuário',
        category: 'user',
        description: 'Disparado quando um usuário faz login no sistema',
        variables: [
            { key: 'user.name', label: 'Nome completo', example: 'João Santos' },
            { key: 'user.firstName', label: 'Primeiro nome', example: 'João' },
            { key: 'user.email', label: 'Email', example: 'joao@escola.com' },
            { key: 'event.date', label: 'Data do login', example: '06/01/2026' },
            { key: 'event.time', label: 'Hora do login', example: '20:08' },
            { key: 'app.name', label: 'Nome do app', example: 'Kadernim' },
            { key: 'app.url', label: 'URL do app', example: 'https://kadernim.com.br' },
        ],
        examplePayload: {
            user: { id: 'usr_456', name: 'João Santos', email: 'joao@escola.com' },
        },
    },

    // ═══════════════════════════════════════════════════════════════
    // CATEGORIA: RECURSOS (MATERIAIS DIDÁTICOS)
    // ═══════════════════════════════════════════════════════════════
    'resource.purchased': {
        name: 'resource.purchased',
        label: 'Compra de Recurso',
        category: 'resource',
        description: 'Disparado quando um usuário compra um recurso didático',
        variables: [
            { key: 'user.name', label: 'Nome do comprador', example: 'Ana Costa' },
            { key: 'user.firstName', label: 'Primeiro nome', example: 'Ana' },
            { key: 'user.email', label: 'Email', example: 'ana@escola.com' },
            { key: 'resource.title', label: 'Nome do recurso', example: 'Atividades de Matemática 5º Ano' },
            { key: 'resource.category', label: 'Categoria', example: 'Matemática' },
            { key: 'resource.url', label: 'Link do recurso', example: 'https://kadernim.com.br/recursos/mat-5ano' },
            { key: 'resource.price', label: 'Preço', example: 'R$ 29,90' },
            { key: 'purchase.amount', label: 'Valor pago', example: 'R$ 29,90' },
            { key: 'purchase.method', label: 'Forma de pagamento', example: 'Cartão de Crédito' },
            { key: 'purchase.date', label: 'Data da compra', example: '06/01/2026' },
            { key: 'app.support.whatsapp', label: 'WhatsApp suporte', example: '+55 61 9869-8704' },
        ],
        examplePayload: {
            user: { id: 'usr_789', name: 'Ana Costa', email: 'ana@escola.com' },
            resource: { id: 'res_123', title: 'Atividades de Matemática 5º Ano', category: 'Matemática', price: 29.90 },
            purchase: { id: 'pur_456', amount: 29.90, method: 'Cartão de Crédito' },
        },
    },

    'resource.accessed': {
        name: 'resource.accessed',
        label: 'Acesso a Recurso Liberado',
        category: 'resource',
        description: 'Disparado quando um administrador libera acesso a um recurso para um usuário',
        variables: [
            { key: 'user.name', label: 'Nome do usuário', example: 'Carlos Mendes' },
            { key: 'user.firstName', label: 'Primeiro nome', example: 'Carlos' },
            { key: 'user.email', label: 'Email', example: 'carlos@escola.com' },
            { key: 'resource.title', label: 'Nome do recurso', example: 'Planos de Aula - Ciências' },
            { key: 'resource.category', label: 'Categoria', example: 'Ciências' },
            { key: 'resource.url', label: 'Link do recurso', example: 'https://kadernim.com.br/recursos/ciencias' },
            { key: 'app.name', label: 'Nome do app', example: 'Kadernim' },
        ],
        examplePayload: {
            user: { id: 'usr_101', name: 'Carlos Mendes', email: 'carlos@escola.com' },
            resource: { id: 'res_202', title: 'Planos de Aula - Ciências', category: 'Ciências' },
        },
    },

    'resource.expiring': {
        name: 'resource.expiring',
        label: 'Acesso a Recurso Expirando',
        category: 'resource',
        description: 'Disparado X dias antes do acesso a um recurso expirar',
        variables: [
            { key: 'user.name', label: 'Nome do usuário', example: 'Paula Lima' },
            { key: 'user.firstName', label: 'Primeiro nome', example: 'Paula' },
            { key: 'user.email', label: 'Email', example: 'paula@escola.com' },
            { key: 'resource.title', label: 'Nome do recurso', example: 'Atividades de Português' },
            { key: 'resource.url', label: 'Link do recurso', example: 'https://kadernim.com.br/recursos/portugues' },
            { key: 'daysRemaining', label: 'Dias restantes', example: '7' },
            { key: 'expiresAt', label: 'Data de expiração', example: '13/01/2026' },
            { key: 'app.url', label: 'URL do app', example: 'https://kadernim.com.br' },
        ],
        examplePayload: {
            user: { id: 'usr_303', name: 'Paula Lima', email: 'paula@escola.com' },
            resource: { id: 'res_404', title: 'Atividades de Português' },
            daysRemaining: 7,
            expiresAt: '2026-01-13',
        },
    },

    // ═══════════════════════════════════════════════════════════════
    // CATEGORIA: ASSINATURAS / PLANOS
    // ═══════════════════════════════════════════════════════════════
    'subscription.created': {
        name: 'subscription.created',
        label: 'Nova Assinatura',
        category: 'subscription',
        description: 'Disparado quando um usuário assina um plano',
        variables: [
            { key: 'user.name', label: 'Nome do assinante', example: 'Roberto Alves' },
            { key: 'user.firstName', label: 'Primeiro nome', example: 'Roberto' },
            { key: 'user.email', label: 'Email', example: 'roberto@escola.com' },
            { key: 'subscription.planName', label: 'Nome do plano', example: 'Plano Premium' },
            { key: 'subscription.amount', label: 'Valor', example: 'R$ 49,90' },
            { key: 'subscription.interval', label: 'Periodicidade', example: 'Mensal' },
            { key: 'subscription.expiresAt', label: 'Válido até', example: '06/02/2026' },
            { key: 'app.name', label: 'Nome do app', example: 'Kadernim' },
        ],
        examplePayload: {
            user: { id: 'usr_505', name: 'Roberto Alves', email: 'roberto@escola.com' },
            subscription: { id: 'sub_606', planName: 'Plano Premium', amount: 49.90, interval: 'monthly', expiresAt: '2026-02-06' },
        },
    },

    'subscription.expiring': {
        name: 'subscription.expiring',
        label: 'Assinatura Expirando',
        category: 'subscription',
        description: 'Disparado X dias antes da assinatura expirar',
        variables: [
            { key: 'user.name', label: 'Nome do assinante', example: 'Fernanda Rocha' },
            { key: 'user.firstName', label: 'Primeiro nome', example: 'Fernanda' },
            { key: 'user.email', label: 'Email', example: 'fernanda@escola.com' },
            { key: 'subscription.planName', label: 'Nome do plano', example: 'Plano Básico' },
            { key: 'subscription.daysRemaining', label: 'Dias restantes', example: '3' },
            { key: 'subscription.expiresAt', label: 'Data de expiração', example: '09/01/2026' },
            { key: 'app.url', label: 'URL para renovar', example: 'https://kadernim.com.br/assinatura' },
        ],
        examplePayload: {
            user: { id: 'usr_707', name: 'Fernanda Rocha', email: 'fernanda@escola.com' },
            subscription: { id: 'sub_808', planName: 'Plano Básico', daysRemaining: 3, expiresAt: '2026-01-09' },
        },
    },

    // ═══════════════════════════════════════════════════════════════
    // CATEGORIA: PLANOS DE AULA
    // ═══════════════════════════════════════════════════════════════
    'lesson_plan.created': {
        name: 'lesson_plan.created',
        label: 'Plano de Aula Criado',
        category: 'lesson_plan',
        description: 'Disparado quando um usuário cria um plano de aula',
        variables: [
            { key: 'user.name', label: 'Nome do professor', example: 'Juliana Martins' },
            { key: 'user.firstName', label: 'Primeiro nome', example: 'Juliana' },
            { key: 'user.email', label: 'Email', example: 'juliana@escola.com' },
            { key: 'lessonPlan.title', label: 'Título do plano', example: 'Fotossíntese - 6º Ano' },
            { key: 'lessonPlan.subject', label: 'Disciplina', example: 'Ciências' },
            { key: 'lessonPlan.grade', label: 'Ano/Série', example: '6º Ano' },
            { key: 'lessonPlan.numberOfClasses', label: 'Número de aulas', example: '4' },
            { key: 'lessonPlan.url', label: 'Link do plano', example: 'https://kadernim.com.br/planos-de-aula/123' },
            { key: 'app.name', label: 'Nome do app', example: 'Kadernim' },
        ],
        examplePayload: {
            user: { id: 'usr_909', name: 'Juliana Martins', email: 'juliana@escola.com' },
            lessonPlan: { id: 'lp_111', title: 'Fotossíntese - 6º Ano', subject: 'Ciências', grade: '6º Ano', numberOfClasses: 4 },
        },
    },

    'lesson_plan.usage_limit': {
        name: 'lesson_plan.usage_limit',
        label: 'Limite de Planos Atingido',
        category: 'lesson_plan',
        description: 'Disparado quando um usuário atinge o limite de criação de planos de aula',
        variables: [
            { key: 'user.name', label: 'Nome do professor', example: 'Ricardo Souza' },
            { key: 'user.firstName', label: 'Primeiro nome', example: 'Ricardo' },
            { key: 'user.email', label: 'Email', example: 'ricardo@escola.com' },
            { key: 'usage.used', label: 'Planos criados', example: '5' },
            { key: 'usage.limit', label: 'Limite mensal', example: '5' },
            { key: 'usage.resetsAt', label: 'Renova em', example: '01/02/2026' },
            { key: 'app.url', label: 'URL para upgrade', example: 'https://kadernim.com.br/planos' },
        ],
        examplePayload: {
            user: { id: 'usr_222', name: 'Ricardo Souza', email: 'ricardo@escola.com' },
            usage: { used: 5, limit: 5, resetsAt: '2026-02-01' },
        },
    },

    // ═══════════════════════════════════════════════════════════════
    // CATEGORIA: COMUNIDADE
    // ═══════════════════════════════════════════════════════════════
    'community.request_created': {
        name: 'community.request_created',
        label: 'Solicitação Criada',
        category: 'community',
        description: 'Disparado quando um usuário cria uma solicitação na comunidade',
        variables: [
            { key: 'user.name', label: 'Nome do solicitante', example: 'Beatriz Oliveira' },
            { key: 'user.firstName', label: 'Primeiro nome', example: 'Beatriz' },
            { key: 'user.email', label: 'Email', example: 'beatriz@escola.com' },
            { key: 'request.title', label: 'Título da solicitação', example: 'Atividades sobre Sistema Solar' },
            { key: 'request.description', label: 'Descrição', example: 'Preciso de atividades práticas...' },
            { key: 'request.url', label: 'Link da solicitação', example: 'https://kadernim.com.br/comunidade/pedidos/123' },
            { key: 'app.name', label: 'Nome do app', example: 'Kadernim' },
        ],
        examplePayload: {
            user: { id: 'usr_333', name: 'Beatriz Oliveira', email: 'beatriz@escola.com' },
            request: { id: 'req_444', title: 'Atividades sobre Sistema Solar', description: 'Preciso de atividades práticas...' },
        },
    },

    'community.request_unfeasible': {
        name: 'community.request_unfeasible',
        label: 'Solicitação Inviável',
        category: 'community',
        description: 'Disparado quando uma solicitação é marcada como inviável',
        variables: [
            { key: 'user.name', label: 'Nome do solicitante', example: 'Gabriel Ferreira' },
            { key: 'user.firstName', label: 'Primeiro nome', example: 'Gabriel' },
            { key: 'user.email', label: 'Email', example: 'gabriel@escola.com' },
            { key: 'request.title', label: 'Título da solicitação', example: 'Material muito específico' },
            { key: 'request.reason', label: 'Motivo da inviabilidade', example: 'Fora do escopo da plataforma' },
            { key: 'app.support.email', label: 'Email de suporte', example: 'contato@kadernim.com.br' },
        ],
        examplePayload: {
            user: { id: 'usr_555', name: 'Gabriel Ferreira', email: 'gabriel@escola.com' },
            request: { id: 'req_666', title: 'Material muito específico', reason: 'Fora do escopo da plataforma' },
        },
    },

    // ═══════════════════════════════════════════════════════════════
    // CATEGORIA: PAGAMENTOS
    // ═══════════════════════════════════════════════════════════════
    'payment.successful': {
        name: 'payment.successful',
        label: 'Pagamento Aprovado',
        category: 'payment',
        description: 'Disparado quando um pagamento é aprovado',
        variables: [
            { key: 'user.name', label: 'Nome do cliente', example: 'Mariana Costa' },
            { key: 'user.firstName', label: 'Primeiro nome', example: 'Mariana' },
            { key: 'user.email', label: 'Email', example: 'mariana@escola.com' },
            { key: 'payment.amount', label: 'Valor', example: 'R$ 99,90' },
            { key: 'payment.method', label: 'Forma de pagamento', example: 'PIX' },
            { key: 'payment.description', label: 'Descrição', example: 'Assinatura Plano Premium' },
            { key: 'payment.date', label: 'Data', example: '06/01/2026' },
            { key: 'app.name', label: 'Nome do app', example: 'Kadernim' },
        ],
        examplePayload: {
            user: { id: 'usr_777', name: 'Mariana Costa', email: 'mariana@escola.com' },
            payment: { id: 'pay_888', amount: 99.90, method: 'PIX', description: 'Assinatura Plano Premium' },
        },
    },

    'payment.failed': {
        name: 'payment.failed',
        label: 'Pagamento Falhou',
        category: 'payment',
        description: 'Disparado quando um pagamento falha',
        variables: [
            { key: 'user.name', label: 'Nome do cliente', example: 'Lucas Pereira' },
            { key: 'user.firstName', label: 'Primeiro nome', example: 'Lucas' },
            { key: 'user.email', label: 'Email', example: 'lucas@escola.com' },
            { key: 'payment.amount', label: 'Valor', example: 'R$ 49,90' },
            { key: 'payment.reason', label: 'Motivo da falha', example: 'Cartão recusado' },
            { key: 'app.support.whatsapp', label: 'WhatsApp suporte', example: '+55 61 9869-8704' },
            { key: 'app.support.email', label: 'Email suporte', example: 'contato@kadernim.com.br' },
        ],
        examplePayload: {
            user: { id: 'usr_999', name: 'Lucas Pereira', email: 'lucas@escola.com' },
            payment: { id: 'pay_000', amount: 49.90, reason: 'Cartão recusado' },
        },
    },
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Retorna todos os eventos disponíveis
 */
export function getAllEvents(): EventSchema[] {
    return Object.values(EVENT_CATALOG);
}

/**
 * Retorna eventos de uma categoria específica
 */
export function getEventsByCategory(category: EventSchema['category']): EventSchema[] {
    return getAllEvents().filter(event => event.category === category);
}

/**
 * Retorna um evento específico pelo nome
 */
export function getEventByName(name: string): EventSchema | undefined {
    return EVENT_CATALOG[name];
}

/**
 * Retorna as variáveis disponíveis para um evento
 */
export function getEventVariables(eventName: string): EventVariable[] {
    const event = getEventByName(eventName);
    return event?.variables || [];
}

/**
 * Valida se um evento existe
 */
export function isValidEvent(eventName: string): boolean {
    return eventName in EVENT_CATALOG;
}

/**
 * Retorna categorias únicas
 */
export function getCategories(): Array<{ value: EventSchema['category']; label: string }> {
    return [
        { value: 'user', label: 'Usuário' },
        { value: 'resource', label: 'Recursos' },
        { value: 'subscription', label: 'Assinaturas' },
        { value: 'lesson_plan', label: 'Planos de Aula' },
        { value: 'community', label: 'Comunidade' },
        { value: 'payment', label: 'Pagamentos' },
    ];
}
