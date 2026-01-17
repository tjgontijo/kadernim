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

interface PlansResponse {
    success: boolean;
    data: LessonPlanResponse[];
}

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

/**
 * Hook to fetch a specific lesson plan by ID
 */
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

/**
 * Hook to fetch all user lesson plans
 */
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

/**
 * Hook to fetch lesson plan generation usage
 */
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
