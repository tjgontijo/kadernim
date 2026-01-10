/**
 * Email Color Constants
 * 
 * Estas cores espelham o design system definido em globals.css
 * mas em formato HEX para máxima compatibilidade com clientes de email.
 * 
 * IMPORTANTE: Ao atualizar cores em globals.css, atualize também aqui.
 */

export const emailColors = {
    // ============================================
    // CORES PRIMÁRIAS (Gradiente roxo)
    // ============================================
    primary: {
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        main: '#667eea',
        dark: '#764ba2',
        light: '#e0e7ff',
        foreground: '#ffffff',
    },

    // ============================================
    // CORES DE FUNDO
    // ============================================
    background: {
        page: '#f9fafb',      // Fundo da página de email
        card: '#ffffff',      // Fundo de cards/containers
        muted: '#f3f4f6',     // Fundo secundário
    },

    // ============================================
    // CORES DE TEXTO
    // ============================================
    text: {
        primary: '#1f2937',   // Texto principal
        secondary: '#6b7280', // Texto secundário
        muted: '#9ca3af',     // Texto menos importante
        link: '#667eea',      // Links
    },

    // ============================================
    // CORES DE STATUS
    // ============================================
    status: {
        success: {
            background: '#d1fae5',
            border: '#10b981',
            text: '#065f46',
        },
        warning: {
            background: '#fef3c7',
            border: '#fcd34d',
            text: '#92400e',
        },
        error: {
            background: '#fee2e2',
            border: '#f87171',
            text: '#991b1b',
        },
        info: {
            background: '#eef2ff',
            border: '#6366f1',
            text: '#312e81',
        },
    },

    // ============================================
    // CORES DE SUPORTE / MARCA
    // ============================================
    brand: {
        supportBox: '#eef2ff',
        supportText: '#4338ca',
        supportTitle: '#312e81',
    },

    // ============================================
    // BORDAS E DIVIDERS
    // ============================================
    border: {
        default: '#e5e7eb',
        light: '#f3f4f6',
    },
} as const

// Tipo helper para acessar cores de forma type-safe
export type EmailColors = typeof emailColors
