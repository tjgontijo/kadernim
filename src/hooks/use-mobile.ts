/**
 * @deprecated Este arquivo é mantido apenas para compatibilidade com código legado.
 * Use `useBreakpoint()` de '@/hooks/use-breakpoint' ao invés.
 * 
 * @example
 * // Antigo (deprecated)
 * const isMobile = useIsMobile()
 * 
 * // Novo (recomendado)
 * const { isMobile, isTablet, isDesktop, isAbove, isBelow } = useBreakpoint()
 */

export { useIsMobile, useBreakpoint } from './use-breakpoint'
