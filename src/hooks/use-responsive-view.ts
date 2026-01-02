import { useEffect, useState } from 'react'
import { ViewType } from '@/components/admin/crud/types'
import { useBreakpoint } from './use-breakpoint'

/**
 * Hook que força a visualização em cards em telas menores que 1200px
 * e permite escolha manual em telas maiores
 */
export function useResponsiveView(manualView: ViewType): ViewType {
    const { isBelow } = useBreakpoint()
    const [actualView, setActualView] = useState<ViewType>(manualView)

    useEffect(() => {
        if (isBelow('desktop')) {
            // Força cards em telas pequenas (< 1200px)
            setActualView('cards')
        } else {
            // Permite escolha manual em telas grandes (>= 1200px)
            setActualView(manualView)
        }
    }, [isBelow, manualView])

    return actualView
}
