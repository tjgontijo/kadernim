'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchKnowledgeAreas, fetchEducationLevels, fetchGrades, fetchSubjects } from '@/lib/taxonomy/api-client';
import type { EducationLevel, Grade, Subject, KnowledgeArea } from '@/lib/taxonomy/types';



interface TaxonomyResponse<T> {
    success: boolean;
    data: T[];
}

export function useKnowledgeAreas() {
    return useQuery({
        queryKey: ['taxonomy', 'knowledge-areas'],
        queryFn: fetchKnowledgeAreas,
        staleTime: 1000 * 60 * 60, // 1 hora de cache (dados estáticos)
    });
}

export function useEducationLevels() {
    return useQuery({
        queryKey: ['taxonomy', 'education-levels'],
        queryFn: fetchEducationLevels,
        staleTime: 1000 * 60 * 60, // 1 hora de cache (dados estáticos)
    });
}

export function useGrades(educationLevelSlug?: string) {
    return useQuery({
        queryKey: ['taxonomy', 'grades', educationLevelSlug],
        queryFn: async () => {
            if (!educationLevelSlug || educationLevelSlug === 'all') return [];
            return fetchGrades(educationLevelSlug);
        },
        enabled: !!educationLevelSlug && educationLevelSlug !== 'all',
        staleTime: 1000 * 60 * 60,
    });
}

export function useSubjects(educationLevelSlug?: string, gradeSlug?: string) {
    return useQuery({
        queryKey: ['taxonomy', 'subjects', educationLevelSlug, gradeSlug],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (educationLevelSlug && educationLevelSlug !== 'all') params.append('educationLevelSlug', educationLevelSlug);
            if (gradeSlug && gradeSlug !== 'all') params.append('gradeSlug', gradeSlug);


            if (params.toString() === '') return [];

            return fetchSubjects(params);
        },
        enabled: (!!educationLevelSlug && educationLevelSlug !== 'all') || (!!gradeSlug && gradeSlug !== 'all'),
        staleTime: 1000 * 60 * 60,
    });
}


