'use client';

import { useQuery } from '@tanstack/react-query';

export interface EducationLevel {
    slug: string;
    name: string;
    order: number;
}

export interface Grade {
    slug: string;
    name: string;
    order: number;
    educationLevelSlug: string;
}

export interface Subject {
    slug: string;
    name: string;
}

export interface BnccSkill {
    code: string;
    description: string;
    unitTheme?: string;
    knowledgeObject?: string;
    fieldOfExperience?: string;
}

interface TaxonomyResponse<T> {
    success: boolean;
    data: T[];
}

export function useEducationLevels() {
    return useQuery({
        queryKey: ['taxonomy', 'education-levels'],
        queryFn: async () => {
            const response = await fetch('/api/v1/education-levels');
            if (!response.ok) throw new Error('Erro ao carregar etapas de ensino');
            const data: TaxonomyResponse<EducationLevel> = await response.json();
            return data.data;
        },
        staleTime: 1000 * 60 * 60, // 1 hora de cache (dados estáticos)
    });
}

export function useGrades(educationLevelSlug?: string) {
    return useQuery({
        queryKey: ['taxonomy', 'grades', educationLevelSlug],
        queryFn: async () => {
            if (!educationLevelSlug || educationLevelSlug === 'all') return [];
            const response = await fetch(`/api/v1/grades?educationLevelSlug=${educationLevelSlug}`);
            if (!response.ok) throw new Error('Erro ao carregar anos/faixas etárias');
            const data: TaxonomyResponse<Grade> = await response.json();
            return data.data;
        },
        enabled: !!educationLevelSlug && educationLevelSlug !== 'all',
        staleTime: 1000 * 60 * 60,
    });
}

export function useSubjects(educationLevelSlug?: string, gradeSlug?: string, bnccOnly?: boolean) {
    return useQuery({
        queryKey: ['taxonomy', 'subjects', educationLevelSlug, gradeSlug, bnccOnly],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (educationLevelSlug && educationLevelSlug !== 'all') params.append('educationLevelSlug', educationLevelSlug);
            if (gradeSlug && gradeSlug !== 'all') params.append('gradeSlug', gradeSlug);
            if (bnccOnly) params.append('bnccOnly', 'true');

            if (params.toString() === '') return [];

            const response = await fetch(`/api/v1/subjects?${params.toString()}`);
            if (!response.ok) throw new Error('Erro ao carregar disciplinas/campos');
            const data: TaxonomyResponse<Subject> = await response.json();
            return data.data;
        },
        enabled: (!!educationLevelSlug && educationLevelSlug !== 'all') || (!!gradeSlug && gradeSlug !== 'all'),
        staleTime: 1000 * 60 * 60,
    });
}

export function useBnccSkills(params: {
    educationLevelSlug: string;
    gradeSlug?: string;
    subjectSlug?: string;
    theme?: string;
    limit?: number;
    searchMode?: 'hybrid' | 'text';
}) {
    return useQuery({
        queryKey: ['bncc-skills', params],
        queryFn: async () => {
            const urlParams = new URLSearchParams({
                educationLevelSlug: params.educationLevelSlug,
                limit: params.limit?.toString() || '50',
            });

            if (params.gradeSlug && params.gradeSlug !== 'all') urlParams.append('gradeSlug', params.gradeSlug);
            if (params.subjectSlug && params.subjectSlug !== 'all') urlParams.append('subjectSlug', params.subjectSlug);
            if (params.theme) {
                urlParams.append('q', params.theme);
                urlParams.append('searchMode', params.searchMode || 'hybrid');
            }

            const response = await fetch(`/api/v1/bncc/skills?${urlParams.toString()}`);
            if (!response.ok) throw new Error('Erro ao carregar habilidades BNCC');

            const data: TaxonomyResponse<BnccSkill> = await response.json();
            return data.data;
        },
        enabled: !!params.educationLevelSlug,
        staleTime: 1000 * 60 * 30, // 30 minutos de cache
    });
}

export function useBnccThemes(params: {
    educationLevelSlug: string;
    gradeSlug?: string;
    subjectSlug?: string;
}) {
    return useQuery({
        queryKey: ['bncc-themes', params],
        queryFn: async () => {
            const urlParams = new URLSearchParams({
                educationLevelSlug: params.educationLevelSlug,
            });

            if (params.gradeSlug && params.gradeSlug !== 'all') urlParams.append('gradeSlug', params.gradeSlug);
            if (params.subjectSlug && params.subjectSlug !== 'all') urlParams.append('subjectSlug', params.subjectSlug);

            const response = await fetch(`/api/v1/bncc/themes?${urlParams.toString()}`);
            if (!response.ok) throw new Error('Erro ao carregar temas BNCC');

            const data = await response.json();
            return data.data.themes as string[];
        },
        enabled: !!params.educationLevelSlug,
        staleTime: 1000 * 60 * 60, // 1 hora de cache (são estáticos)
    });
}
