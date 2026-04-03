'use client';

import { useQuery } from '@tanstack/react-query';
import {
    fetchLessonPlan,
    fetchLessonPlans,
    fetchLessonPlanUsage,
} from '@/lib/lesson-plans/api-client';

/**
 * Hook to fetch a specific lesson plan by ID
 */
export function useLessonPlan(id: string) {
    return useQuery({
        queryKey: ['lesson-plan', id],
        queryFn: () => fetchLessonPlan(id),
        enabled: !!id,
    });
}

/**
 * Hook to fetch all user lesson plans
 */
export function useLessonPlans() {
    return useQuery({
        queryKey: ['lesson-plans'],
        queryFn: fetchLessonPlans,
    });
}

/**
 * Hook to fetch lesson plan generation usage
 */
export function useLessonPlanUsage() {
    return useQuery({
        queryKey: ['lesson-plan-usage'],
        queryFn: fetchLessonPlanUsage,
    });
}
