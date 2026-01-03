'use client';

import { useQuery } from '@tanstack/react-query';
import { type LessonPlanResponse } from '@/lib/schemas/lesson-plan';

interface BnccSkillDescription {
    code: string;
    description: string;
}

interface PlanWithDescriptions extends LessonPlanResponse {
    bnccSkillDescriptions: BnccSkillDescription[];
}

interface PlanResponse {
    success: boolean;
    data: PlanWithDescriptions;
}

export function useLessonPlan(id: string) {
    return useQuery({
        queryKey: ['lesson-plan', id],
        queryFn: async () => {
            const response = await fetch(`/api/v1/lesson-plans/${id}`);
            if (!response.ok) {
                throw new Error('Erro ao carregar o plano de aula');
            }
            const json: PlanResponse = await response.json();
            return json.data;
        },
        enabled: !!id,
    });
}
