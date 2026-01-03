'use client';

import { useQuery } from '@tanstack/react-query';
import { type LessonPlanResponse } from '@/lib/schemas/lesson-plan';

interface PlansResponse {
    success: boolean;
    data: LessonPlanResponse[];
}

export function useLessonPlans() {
    return useQuery({
        queryKey: ['lesson-plans'],
        queryFn: async () => {
            const response = await fetch('/api/v1/lesson-plans');
            if (!response.ok) {
                throw new Error('Erro ao carregar planos de aula');
            }
            const json: PlansResponse = await response.json();
            return json.data;
        },
    });
}
