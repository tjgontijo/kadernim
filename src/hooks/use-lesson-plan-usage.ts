'use client';

import { useQuery } from '@tanstack/react-query';

interface UsageResponse {
    success: boolean;
    data: {
        used: number;
        limit: number;
        remaining: number;
        resetsAt: string;
        yearMonth: string;
    };
}

export function useLessonPlanUsage() {
    return useQuery({
        queryKey: ['lesson-plan-usage'],
        queryFn: async () => {
            const response = await fetch('/api/v1/lesson-plans/usage');
            if (!response.ok) {
                throw new Error('Erro ao buscar uso de planos de aula');
            }
            const json: UsageResponse = await response.json();

            const { used, limit, remaining } = json.data;
            const percentage = Math.min(Math.round((used / limit) * 100), 100);

            return {
                ...json.data,
                percentage
            };
        },
    });
}
