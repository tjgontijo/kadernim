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
    const [width, setWidth] = useState<number>(0)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
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
        if (!isMounted) return false
        return width >= BREAKPOINTS[breakpoint]
    }

    /**
     * Verifica se a tela é menor que o breakpoint especificado
     */
    const isBelow = (breakpoint: Breakpoint): boolean => {
        if (!isMounted) return false
        return width < BREAKPOINTS[breakpoint]
    }

    /**
     * Verifica se a tela está entre dois breakpoints
     */
    const isBetween = (min: Breakpoint, max: Breakpoint): boolean => {
        if (!isMounted) return false
        return width >= BREAKPOINTS[min] && width < BREAKPOINTS[max]
    }

    return {
        // Largura atual
        width: isMounted ? width : 0,

        // Helpers de breakpoint
        isAbove,
        isBelow,
        isBetween,

        // Atalhos comuns (compatibilidade com use-mobile.ts)
        isMobile: isMounted ? width < BREAKPOINTS.mobile : false,
        isTablet: isMounted ? isBetween('mobile', 'desktop') : false,
        isDesktop: isMounted ? width >= BREAKPOINTS.desktop : true, // Default p/ desktop no server
        isWide: isMounted ? width >= BREAKPOINTS.wide : false,

        // Breakpoints Tailwind padrão
        isSm: isMounted ? width >= BREAKPOINTS.sm : false,
        isMd: isMounted ? width >= BREAKPOINTS.md : false,
        isLg: isMounted ? width >= BREAKPOINTS.lg : false,
        isXl: isMounted ? width >= BREAKPOINTS.xl : false,
        is2xl: isMounted ? width >= BREAKPOINTS['2xl'] : false,
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
