'use client'

import React, { createContext, useContext, ReactNode, useState } from 'react'

type ResourceContextType = {
    resourceTitle: string | null
    setResourceTitle: (title: string | null) => void
}

const ResourceContext = createContext<ResourceContextType | undefined>(undefined)

export function ResourceProvider({ children }: { children: ReactNode }) {
    const [resourceTitle, setResourceTitle] = useState<string | null>(null)

    return (
        <ResourceContext.Provider value={{ resourceTitle, setResourceTitle }}>
            {children}
        </ResourceContext.Provider>
    )
}

export function useResource() {
    const context = useContext(ResourceContext)
    if (context === undefined) {
        throw new Error('useResource must be used within a ResourceProvider')
    }
    return context
}
