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
