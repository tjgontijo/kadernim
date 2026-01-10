/**
 * Catálogo de Eventos do Kadernim
 * 
 * Este arquivo centraliza TODOS os eventos do sistema que podem disparar notificações.
 * 
 * IMPORTANTE: Ao adicionar um novo caso de uso:
 * 1. Adicione o evento aqui com seu schema
 * 2. Emita o evento no código usando emitEvent()
 * 3. Admin poderá criar templates e automações na UI
 * 
 * NOTA: Os nomes dos eventos DEVEM bater exatamente com os definidos em client.ts (Inngest).
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
    category: 'auth' | 'user' | 'resource' | 'subscription' | 'lesson_plan' | 'community' | 'payment';

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
    // CATEGORIA: AUTENTICAÇÃO
    // ═══════════════════════════════════════════════════════════════
    'auth.otp.requested': {
        name: 'auth.otp.requested',
        label: 'Código OTP Solicitado',
        category: 'auth',
        description: 'Disparado quando um usuário solicita um código OTP para login',
        variables: [
            { key: 'user.email', label: 'Email do usuário', example: 'maria@escola.com' },
            { key: 'user.name', label: 'Nome do usuário', example: 'Maria Silva' },
            { key: 'user.firstName', label: 'Primeiro nome', example: 'Maria' },
            { key: 'user.phone', label: 'Telefone', example: '+55 61 98765-4321' },
            { key: 'otp.code', label: 'Código OTP', example: '123456' },
            { key: 'otp.expiresIn', label: 'Expira em (minutos)', example: '15' },
            { key: 'app.name', label: 'Nome do app', example: 'Kadernim' },
            { key: 'app.url', label: 'URL do app', example: 'https://kadernim.com.br' },
        ],
        examplePayload: {
            user: { email: 'maria@escola.com', name: 'Maria Silva', phone: '+5561987654321' },
            otp: { code: '123456', expiresIn: 15 },
        },
    },

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
            { key: 'user.phone', label: 'Telefone', example: '+55 61 98765-4321' },
            { key: 'event.date', label: 'Data do evento', example: '06/01/2026' },
            { key: 'event.time', label: 'Hora do evento', example: '20:08' },
            { key: 'app.name', label: 'Nome do app', example: 'Kadernim' },
            { key: 'app.url', label: 'URL do app', example: 'https://kadernim.com.br' },
        ],
        examplePayload: {
            user: { id: 'usr_123', name: 'Maria Silva', email: 'maria@escola.com', phone: '+5561987654321' },
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
            { key: 'user.phone', label: 'Telefone', example: '+55 61 98765-4321' },
            { key: 'login.method', label: 'Método de login', example: 'OTP' },
            { key: 'event.date', label: 'Data do login', example: '06/01/2026' },
            { key: 'event.time', label: 'Hora do login', example: '20:08' },
            { key: 'app.name', label: 'Nome do app', example: 'Kadernim' },
            { key: 'app.url', label: 'URL do app', example: 'https://kadernim.com.br' },
        ],
        examplePayload: {
            user: { id: 'usr_456', name: 'João Santos', email: 'joao@escola.com' },
            login: { method: 'OTP' },
        },
    },

    'user.subscription.created': {
        name: 'user.subscription.created',
        label: 'Nova Assinatura',
        category: 'user',
        description: 'Disparado quando um usuário assina um plano (tornando-se subscriber)',
        variables: [
            { key: 'user.name', label: 'Nome do assinante', example: 'Roberto Alves' },
            { key: 'user.firstName', label: 'Primeiro nome', example: 'Roberto' },
            { key: 'user.email', label: 'Email', example: 'roberto@escola.com' },
            { key: 'user.phone', label: 'Telefone', example: '+55 61 98765-4321' },
            { key: 'subscription.planId', label: 'ID do plano', example: 'sub_123' },
            { key: 'subscription.planName', label: 'Nome do plano', example: 'Assinatura Premium' },
            { key: 'subscription.expiresAt', label: 'Válido até', example: '06/02/2026' },
            { key: 'event.date', label: 'Data da assinatura', example: '06/01/2026' },
            { key: 'app.name', label: 'Nome do app', example: 'Kadernim' },
            { key: 'app.url', label: 'URL do app', example: 'https://kadernim.com.br' },
        ],
        examplePayload: {
            user: { id: 'usr_505', name: 'Roberto Alves', email: 'roberto@escola.com' },
            subscription: { planId: 'sub_606', planName: 'Assinatura Premium', expiresAt: '2026-02-06' },
        },
    },

    'user.subscription.expiring': {
        name: 'user.subscription.expiring',
        label: 'Assinatura Expirando',
        category: 'user',
        description: 'Disparado X dias antes da assinatura expirar',
        variables: [
            { key: 'user.name', label: 'Nome do assinante', example: 'Fernanda Rocha' },
            { key: 'user.firstName', label: 'Primeiro nome', example: 'Fernanda' },
            { key: 'user.email', label: 'Email', example: 'fernanda@escola.com' },
            { key: 'user.phone', label: 'Telefone', example: '+55 61 98765-4321' },
            { key: 'subscription.planName', label: 'Nome do plano', example: 'Assinatura Premium' },
            { key: 'subscription.daysRemaining', label: 'Dias restantes', example: '3' },
            { key: 'subscription.expiresAt', label: 'Data de expiração', example: '09/01/2026' },
            { key: 'app.url', label: 'URL para renovar', example: 'https://kadernim.com.br/assinatura' },
        ],
        examplePayload: {
            user: { id: 'usr_707', name: 'Fernanda Rocha', email: 'fernanda@escola.com' },
            subscription: { planName: 'Assinatura Premium', daysRemaining: 3, expiresAt: '2026-01-09' },
        },
    },

    'user.resource.access_granted': {
        name: 'user.resource.access_granted',
        label: 'Acesso a Recursos Liberado',
        category: 'user',
        description: 'Disparado quando um usuário recebe acesso a um ou mais recursos (via webhook de matrícula)',
        variables: [
            { key: 'user.name', label: 'Nome do usuário', example: 'Carlos Mendes' },
            { key: 'user.firstName', label: 'Primeiro nome', example: 'Carlos' },
            { key: 'user.email', label: 'Email', example: 'carlos@escola.com' },
            { key: 'user.phone', label: 'Telefone', example: '+55 61 98765-4321' },
            { key: 'resources.count', label: 'Quantidade de recursos', example: '3' },
            { key: 'resources.titles', label: 'Nomes dos recursos', example: 'Matemática 5º Ano, Português 5º Ano' },
            { key: 'source', label: 'Origem da matrícula', example: 'Yampi' },
            { key: 'app.name', label: 'Nome do app', example: 'Kadernim' },
            { key: 'app.url', label: 'URL do app', example: 'https://kadernim.com.br' },
        ],
        examplePayload: {
            user: { id: 'usr_101', name: 'Carlos Mendes', email: 'carlos@escola.com' },
            resources: { count: 3, titles: 'Matemática 5º Ano, Português 5º Ano' },
            source: 'Yampi',
        },
    },

    // ═══════════════════════════════════════════════════════════════
    // CATEGORIA: RECURSOS (MATERIAIS DIDÁTICOS)
    // ═══════════════════════════════════════════════════════════════
    'resource.created': {
        name: 'resource.created',
        label: 'Recurso Criado',
        category: 'resource',
        description: 'Disparado quando um administrador cria um novo recurso didático',
        variables: [
            { key: 'resource.id', label: 'ID do recurso', example: 'res_123' },
            { key: 'resource.title', label: 'Nome do recurso', example: 'Atividades de Matemática 5º Ano' },
            { key: 'resource.educationLevel', label: 'Nível de ensino', example: 'Ensino Fundamental I' },
            { key: 'resource.subject', label: 'Disciplina', example: 'Matemática' },
            { key: 'admin.id', label: 'ID do admin', example: 'usr_admin' },
            { key: 'event.date', label: 'Data de criação', example: '06/01/2026' },
        ],
        examplePayload: {
            resource: { id: 'res_123', title: 'Atividades de Matemática 5º Ano', educationLevel: 'Ensino Fundamental I', subject: 'Matemática' },
            admin: { id: 'usr_admin' },
        },
    },

    'resource.purchased': {
        name: 'resource.purchased',
        label: 'Compra de Recurso',
        category: 'resource',
        description: 'Disparado quando um usuário compra um recurso didático',
        variables: [
            { key: 'user.name', label: 'Nome do comprador', example: 'Ana Costa' },
            { key: 'user.firstName', label: 'Primeiro nome', example: 'Ana' },
            { key: 'user.email', label: 'Email', example: 'ana@escola.com' },
            { key: 'user.phone', label: 'Telefone', example: '+55 61 98765-4321' },
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

    'resource.expiring': {
        name: 'resource.expiring',
        label: 'Acesso a Recurso Expirando',
        category: 'resource',
        description: 'Disparado X dias antes do acesso a um recurso expirar',
        variables: [
            { key: 'user.name', label: 'Nome do usuário', example: 'Paula Lima' },
            { key: 'user.firstName', label: 'Primeiro nome', example: 'Paula' },
            { key: 'user.email', label: 'Email', example: 'paula@escola.com' },
            { key: 'user.phone', label: 'Telefone', example: '+55 61 98765-4321' },
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
    // CATEGORIA: PLANOS DE AULA
    // ═══════════════════════════════════════════════════════════════
    'lesson-plan.created': {
        name: 'lesson-plan.created',
        label: 'Plano de Aula Criado',
        category: 'lesson_plan',
        description: 'Disparado quando um usuário cria um plano de aula com IA',
        variables: [
            { key: 'user.name', label: 'Nome do professor', example: 'Juliana Martins' },
            { key: 'user.firstName', label: 'Primeiro nome', example: 'Juliana' },
            { key: 'user.email', label: 'Email', example: 'juliana@escola.com' },
            { key: 'user.phone', label: 'Telefone', example: '+55 61 98765-4321' },
            { key: 'lessonPlan.id', label: 'ID do plano', example: 'lp_111' },
            { key: 'lessonPlan.title', label: 'Título do plano', example: 'Fotossíntese - 6º Ano' },
            { key: 'lessonPlan.subject', label: 'Disciplina', example: 'Ciências' },
            { key: 'lessonPlan.grade', label: 'Ano/Série', example: '6º Ano' },
            { key: 'lessonPlan.url', label: 'Link do plano', example: 'https://kadernim.com.br/planos-de-aula/123' },
            { key: 'app.name', label: 'Nome do app', example: 'Kadernim' },
        ],
        examplePayload: {
            user: { id: 'usr_909', name: 'Juliana Martins', email: 'juliana@escola.com' },
            lessonPlan: { id: 'lp_111', title: 'Fotossíntese - 6º Ano', subject: 'Ciências', grade: '6º Ano' },
        },
    },

    'lesson-plan.usage_limit': {
        name: 'lesson-plan.usage_limit',
        label: 'Limite de Planos Atingido',
        category: 'lesson_plan',
        description: 'Disparado quando um usuário atinge o limite de criação de planos de aula',
        variables: [
            { key: 'user.name', label: 'Nome do professor', example: 'Ricardo Souza' },
            { key: 'user.firstName', label: 'Primeiro nome', example: 'Ricardo' },
            { key: 'user.email', label: 'Email', example: 'ricardo@escola.com' },
            { key: 'user.phone', label: 'Telefone', example: '+55 61 98765-4321' },
            { key: 'usage.used', label: 'Planos criados', example: '30' },
            { key: 'usage.limit', label: 'Limite mensal', example: '30' },
            { key: 'usage.resetsAt', label: 'Renova em', example: '01/02/2026' },
            { key: 'app.url', label: 'URL para upgrade', example: 'https://kadernim.com.br/planos' },
        ],
        examplePayload: {
            user: { id: 'usr_222', name: 'Ricardo Souza', email: 'ricardo@escola.com' },
            usage: { used: 30, limit: 30, resetsAt: '2026-02-01' },
        },
    },

    // ═══════════════════════════════════════════════════════════════
    // CATEGORIA: COMUNIDADE
    // ═══════════════════════════════════════════════════════════════
    'community.request.created': {
        name: 'community.request.created',
        label: 'Solicitação Criada',
        category: 'community',
        description: 'Disparado quando um usuário cria uma solicitação na comunidade',
        variables: [
            { key: 'user.name', label: 'Nome do solicitante', example: 'Beatriz Oliveira' },
            { key: 'user.firstName', label: 'Primeiro nome', example: 'Beatriz' },
            { key: 'user.email', label: 'Email', example: 'beatriz@escola.com' },
            { key: 'user.phone', label: 'Telefone', example: '+55 61 98765-4321' },
            { key: 'request.id', label: 'ID da solicitação', example: 'req_444' },
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

    'community.request.voted': {
        name: 'community.request.voted',
        label: 'Voto em Solicitação',
        category: 'community',
        description: 'Disparado quando alguém vota em uma solicitação da comunidade',
        variables: [
            { key: 'request.id', label: 'ID da solicitação', example: 'req_444' },
            { key: 'request.title', label: 'Título da solicitação', example: 'Atividades sobre Sistema Solar' },
            { key: 'request.voteCount', label: 'Total de votos', example: '15' },
            { key: 'voter.id', label: 'ID de quem votou', example: 'usr_789' },
            { key: 'voter.name', label: 'Nome de quem votou', example: 'Maria Silva' },
            { key: 'author.id', label: 'ID do autor original', example: 'usr_333' },
            { key: 'author.name', label: 'Nome do autor', example: 'Beatriz Oliveira' },
            { key: 'author.email', label: 'Email do autor', example: 'beatriz@escola.com' },
        ],
        examplePayload: {
            request: { id: 'req_444', title: 'Atividades sobre Sistema Solar', voteCount: 15 },
            voter: { id: 'usr_789', name: 'Maria Silva' },
            author: { id: 'usr_333', name: 'Beatriz Oliveira', email: 'beatriz@escola.com' },
        },
    },

    'community.request.selected': {
        name: 'community.request.selected',
        label: 'Solicitação Selecionada',
        category: 'community',
        description: 'Disparado quando uma solicitação é selecionada no Top 10 do mês',
        variables: [
            { key: 'request.id', label: 'ID da solicitação', example: 'req_444' },
            { key: 'request.title', label: 'Título da solicitação', example: 'Atividades sobre Sistema Solar' },
            { key: 'request.url', label: 'Link da solicitação', example: 'https://kadernim.com.br/comunidade/pedidos/123' },
            { key: 'author.id', label: 'ID do autor', example: 'usr_333' },
            { key: 'author.name', label: 'Nome do autor', example: 'Beatriz Oliveira' },
            { key: 'author.email', label: 'Email do autor', example: 'beatriz@escola.com' },
            { key: 'author.phone', label: 'Telefone do autor', example: '+55 61 98765-4321' },
            { key: 'app.name', label: 'Nome do app', example: 'Kadernim' },
        ],
        examplePayload: {
            request: { id: 'req_444', title: 'Atividades sobre Sistema Solar' },
            author: { id: 'usr_333', name: 'Beatriz Oliveira', email: 'beatriz@escola.com' },
        },
    },

    'community.request.completed': {
        name: 'community.request.completed',
        label: 'Solicitação Atendida',
        category: 'community',
        description: 'Disparado quando o conteúdo solicitado é publicado',
        variables: [
            { key: 'request.id', label: 'ID da solicitação', example: 'req_444' },
            { key: 'request.title', label: 'Título original', example: 'Atividades sobre Sistema Solar' },
            { key: 'resource.id', label: 'ID do recurso criado', example: 'res_555' },
            { key: 'resource.title', label: 'Nome do recurso', example: 'Sistema Solar - Atividades Práticas' },
            { key: 'resource.url', label: 'Link do recurso', example: 'https://kadernim.com.br/recursos/sistema-solar' },
            { key: 'author.id', label: 'ID do autor', example: 'usr_333' },
            { key: 'author.name', label: 'Nome do autor', example: 'Beatriz Oliveira' },
            { key: 'author.email', label: 'Email do autor', example: 'beatriz@escola.com' },
            { key: 'author.phone', label: 'Telefone do autor', example: '+55 61 98765-4321' },
        ],
        examplePayload: {
            request: { id: 'req_444', title: 'Atividades sobre Sistema Solar' },
            resource: { id: 'res_555', title: 'Sistema Solar - Atividades Práticas' },
            author: { id: 'usr_333', name: 'Beatriz Oliveira', email: 'beatriz@escola.com' },
        },
    },

    'community.request.unfeasible': {
        name: 'community.request.unfeasible',
        label: 'Solicitação Inviável',
        category: 'community',
        description: 'Disparado quando uma solicitação é marcada como inviável',
        variables: [
            { key: 'request.id', label: 'ID da solicitação', example: 'req_666' },
            { key: 'request.title', label: 'Título da solicitação', example: 'Material muito específico' },
            { key: 'request.reason', label: 'Motivo da inviabilidade', example: 'Fora do escopo da plataforma' },
            { key: 'author.id', label: 'ID do autor', example: 'usr_555' },
            { key: 'author.name', label: 'Nome do autor', example: 'Gabriel Ferreira' },
            { key: 'author.email', label: 'Email do autor', example: 'gabriel@escola.com' },
            { key: 'author.phone', label: 'Telefone do autor', example: '+55 61 98765-4321' },
            { key: 'app.support.email', label: 'Email de suporte', example: 'contato@kadernim.com.br' },
        ],
        examplePayload: {
            request: { id: 'req_666', title: 'Material muito específico', reason: 'Fora do escopo da plataforma' },
            author: { id: 'usr_555', name: 'Gabriel Ferreira', email: 'gabriel@escola.com' },
        },
    },

    'community.cleanup.deleted': {
        name: 'community.cleanup.deleted',
        label: 'Solicitação Removida por Limpeza',
        category: 'community',
        description: 'Disparado quando uma solicitação é removida automaticamente por baixo apoio',
        variables: [
            { key: 'request.id', label: 'ID da solicitação', example: 'req_777' },
            { key: 'request.title', label: 'Título da solicitação', example: 'Atividade genérica' },
            { key: 'request.reason', label: 'Motivo da remoção', example: 'Sem votos após 3 meses' },
            { key: 'author.id', label: 'ID do autor', example: 'usr_888' },
            { key: 'author.name', label: 'Nome do autor', example: 'Pedro Santos' },
            { key: 'author.email', label: 'Email do autor', example: 'pedro@escola.com' },
            { key: 'app.name', label: 'Nome do app', example: 'Kadernim' },
        ],
        examplePayload: {
            request: { id: 'req_777', title: 'Atividade genérica', reason: 'Sem votos após 3 meses' },
            author: { id: 'usr_888', name: 'Pedro Santos', email: 'pedro@escola.com' },
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
            { key: 'user.phone', label: 'Telefone', example: '+55 61 98765-4321' },
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
            { key: 'user.phone', label: 'Telefone', example: '+55 61 98765-4321' },
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
        { value: 'auth', label: 'Autenticação' },
        { value: 'user', label: 'Usuário' },
        { value: 'resource', label: 'Recursos' },
        { value: 'lesson_plan', label: 'Planos de Aula' },
        { value: 'community', label: 'Comunidade' },
        { value: 'payment', label: 'Pagamentos' },
    ];
}
