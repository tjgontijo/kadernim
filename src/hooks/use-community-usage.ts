'use client'

import { useQuery } from '@tanstack/react-query'

interface CommunityUsageResponse {
    success: boolean
    data: {
        used: number
        limit: number
        remaining: number
        resetsAt: string
        yearMonth: string
    }
}

export function useCommunityUsage() {
    return useQuery({
        queryKey: ['community.usage'],
        queryFn: async () => {
            const response = await fetch('/api/v1/community/usage')
            if (!response.ok) {
                throw new Error('Erro ao buscar uso da comunidade')
            }
            const json: CommunityUsageResponse = await response.json()
            return json.data
        },
    })
}
