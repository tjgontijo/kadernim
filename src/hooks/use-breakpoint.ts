import { useEffect, useState } from 'react'

/**
 * Breakpoints padrão do Tailwind CSS
 * Pode ser customizado conforme necessário
 */
export const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
    // Breakpoints customizados
    mobile: 768,      // Mesmo que md
    tablet: 1024,     // Mesmo que lg
    desktop: 1200,    // Breakpoint customizado para CRUD
    wide: 1536,       // Mesmo que 2xl
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

/**
 * Hook que retorna informações sobre o tamanho da tela atual
 * 
 * @example
 * const { isMobile, isTablet, isDesktop, width, isAbove, isBelow } = useBreakpoint()
 * 
 * if (isMobile) {
 *   // Renderiza versão mobile
 * }
 * 
 * if (isAbove('lg')) {
 *   // Tela maior que 1024px
 * }
 */
export function useBreakpoint() {
    const [width, setWidth] = useState<number>(
        typeof window !== 'undefined' ? window.innerWidth : 0
    )

    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth)
        }

        // Usa matchMedia para melhor performance
        const mediaQueries = Object.entries(BREAKPOINTS).map(([key, value]) => {
            const mql = window.matchMedia(`(min-width: ${value}px)`)
            mql.addEventListener('change', handleResize)
            return { key, mql }
        })

        // Set inicial
        handleResize()

        // Cleanup
        return () => {
            mediaQueries.forEach(({ mql }) => {
                mql.removeEventListener('change', handleResize)
            })
        }
    }, [])

    /**
     * Verifica se a tela é maior ou igual ao breakpoint especificado
     */
    const isAbove = (breakpoint: Breakpoint): boolean => {
        return width >= BREAKPOINTS[breakpoint]
    }

    /**
     * Verifica se a tela é menor que o breakpoint especificado
     */
    const isBelow = (breakpoint: Breakpoint): boolean => {
        return width < BREAKPOINTS[breakpoint]
    }

    /**
     * Verifica se a tela está entre dois breakpoints
     */
    const isBetween = (min: Breakpoint, max: Breakpoint): boolean => {
        return width >= BREAKPOINTS[min] && width < BREAKPOINTS[max]
    }

    return {
        // Largura atual
        width,

        // Helpers de breakpoint
        isAbove,
        isBelow,
        isBetween,

        // Atalhos comuns (compatibilidade com use-mobile.ts)
        isMobile: width < BREAKPOINTS.mobile,
        isTablet: isBetween('mobile', 'desktop'),
        isDesktop: width >= BREAKPOINTS.desktop,
        isWide: width >= BREAKPOINTS.wide,

        // Breakpoints Tailwind padrão
        isSm: width >= BREAKPOINTS.sm,
        isMd: width >= BREAKPOINTS.md,
        isLg: width >= BREAKPOINTS.lg,
        isXl: width >= BREAKPOINTS.xl,
        is2xl: width >= BREAKPOINTS['2xl'],
    }
}

/**
 * Hook legado para compatibilidade com código existente
 * @deprecated Use useBreakpoint() ao invés
 */
export function useIsMobile() {
    const { isMobile } = useBreakpoint()
    return isMobile
}
