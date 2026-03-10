'use client';

import { useQuery } from '@tanstack/react-query';

interface CommunityConfigResponse {
    success: boolean;
    data: {
        requests: {
            limit: number;
        };
        uploads: {
            maxFiles: number;
            maxSizeMB: number;
        };
    };
}

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

/**
 * Hook to fetch community feature configurations
 */
export function useCommunityConfig() {
    return useQuery({
        queryKey: ['community.config'],
        queryFn: async () => {
            const response = await fetch('/api/v1/community/config');
            if (!response.ok) {
                throw new Error('Erro ao buscar configurações da comunidade');
            }
            const json: CommunityConfigResponse = await response.json();
            return json.data;
        },
    });
}

/**
 * Hook to fetch community usage limits and current usage
 */
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
