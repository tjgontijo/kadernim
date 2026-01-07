'use client'

import { useQuery } from '@tanstack/react-query'

export interface ResourceMetaItem {
    key: string
    label: string
}

export interface ResourceMetaResponse {
    educationLevels: ResourceMetaItem[]
    subjects: ResourceMetaItem[]
    grades: (ResourceMetaItem & { educationLevelKey: string; subjects: string[] })[]
    user: {
        role: string | null
        isAdmin: boolean
        isSubscriber: boolean
    }
}

export function useResourceMeta() {
    return useQuery<ResourceMetaResponse>({
        queryKey: ['resource-meta'],
        queryFn: async () => {
            const response = await fetch('/api/v1/resources/meta')
            if (!response.ok) {
                throw new Error('Failed to fetch resource metadata')
            }
            return response.json()
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    })
}
