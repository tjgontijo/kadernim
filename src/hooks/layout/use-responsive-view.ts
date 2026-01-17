import { useEffect } from 'react'
import { ViewType } from '@/components/admin/crud/types'
import { useMobile } from './use-mobile'

/**
 * Hook que força a visualização em cards em telas menores que tablet (< 1024px)
 * e permite escolha manual em telas maiores
 */
export function useResponsiveView(view: ViewType, setView: (view: ViewType) => void): void {
    const { isBelow } = useMobile()

    useEffect(() => {
        if (isBelow('tablet')) {
            // Força cards em telas pequenas (< 1024px - mobile e tablet)
            if (view !== 'cards') {
                setView('cards')
            }
        }
        // Em telas >= 1024px permite que o usuário controle manualmente
    }, [isBelow, view, setView])
}
