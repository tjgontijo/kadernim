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
    // CORES PRIMÁRIAS (Terracota Editorial)
    // ============================================
    primary: {
        main: '#D97757',      // Terracotta
        dark: '#B85C3D',      // Terracotta Darker
        light: '#F8EBE6',     // Terracotta-2 (tint)
        foreground: '#ffffff',
    },

    // ============================================
    // CORES DE FUNDO (Textura de Papel)
    // ============================================
    background: {
        page: '#FBF6EC',      // --paper
        card: '#ffffff',      // --surface-card (branco total para contraste)
        muted: '#F5F0E4',     // --paper-2
    },

    // ============================================
    // CORES DE TEXTO (Ink)
    // ============================================
    text: {
        primary: '#2B2620',   // --ink
        secondary: '#6B5F52', // --ink-soft
        muted: '#8C8071',     // --ink-mute
        link: '#D97757',      // Mesma que a primária
    },

    // ============================================
    // CORES DE STATUS
    // ============================================
    status: {
        success: {
            background: '#F4F7F2', // sage-2 tint
            border: '#6B8E5A',     // --sage
            text: '#3D5233',
        },
        warning: {
            background: '#FAF7F0', // mustard-2 tint
            border: '#E8B14E',     // --mustard
            text: '#8C6B2F',
        },
        error: {
            background: '#F9F2F2', // berry-2 tint
            border: '#A83F3F',     // --berry (estimado)
            text: '#6B2828',
        },
        info: {
            background: '#F0F4FA', // ink-accent tint
            border: '#355EAD',     // --ink-accent (estimado)
            text: '#223C6B',
        },
    },

    // ============================================
    // CORES DE SUPORTE / MARCA
    // ============================================
    brand: {
        supportBox: '#F5F0E4',
        supportText: '#6B5F52',
        supportTitle: '#2B2620',
    },

    // ============================================
    // BORDAS E DIVIDERS (Caderno)
    // ============================================
    border: {
        default: '#E0D8CC',   // --line
        light: '#EBE4D8',     // --line-soft
    },
} as const

// Tipo helper para acessar cores de forma type-safe
export type EmailColors = typeof emailColors
