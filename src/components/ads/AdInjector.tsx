'use client'

import { Children, ReactNode } from 'react'
import { AdSlot } from './AdSlot'

interface AdInjectorProps {
  children: ReactNode
  injectAfter?: number // Injeta ad após N elementos (padrão: 3)
  variant?: 'default' | 'compact' | 'minimal'
  enabled?: boolean // Permite desabilitar injection
}

/**
 * AdInjector - Injeta banners automaticamente entre elementos
 * Similar ao AdSense que injeta ads entre parágrafos/cards
 * 
 * Uso em Grid:
 * <div className="grid grid-cols-4">
 *   <AdInjector injectAfter={4}>
 *     {resources.map(resource => <ResourceCard key={resource.id} {...resource} />)}
 *   </AdInjector>
 * </div>
 */
export function AdInjector({ 
  children, 
  injectAfter = 4, 
  variant = 'compact',
  enabled = true 
}: AdInjectorProps) {
  
  if (!enabled) {
    return <>{children}</>
  }

  const childrenArray = Children.toArray(children)
  const result: ReactNode[] = []

  childrenArray.forEach((child, index) => {
    result.push(child)
    
    // Injeta ad após N elementos
    if ((index + 1) % injectAfter === 0 && index < childrenArray.length - 1) {
      result.push(
        <div key={`ad-${index}`} className="col-span-full">
          <AdSlot 
            slot="inline" 
            variant={variant}
            position={index + 1}
          />
        </div>
      )
    }
  })

  return <>{result}</>
}
