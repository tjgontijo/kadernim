import { z } from 'zod';

/**
 * Schema para o conteúdo estruturado do plano de aula (campo content em LessonPlan)
 *
 * Estrutura baseada em boas práticas pedagógicas BNCC
 */

// 1. Identificação do plano
export const LessonPlanIdentificationSchema = z.object({
  school: z.string().optional(), // Nome da escola
  teacher: z.string().optional(), // Nome do professor
  class: z.string().optional(), // Turma (ex: "3º Ano A")
  date: z.string().optional(), // Data prevista (YYYY-MM-DD)
});

// 2. Habilidade BNCC completa (enriquecida)
export const BnccSkillDetailSchema = z.object({
  code: z.string(), // EF03MA09
  description: z.string(), // Descrição completa da habilidade
  unitTheme: z.string().optional(), // Unidade temática (EF)
  knowledgeObject: z.string().optional(), // Objeto de conhecimento (EF)
  fieldOfExperience: z.string().optional(), // Campo de experiência (EI)
});

// 3. Objetivos de aprendizagem
export const LessonPlanObjectivesSchema = z.object({
  general: z.string(), // Objetivo geral da aula
  specific: z.array(z.string()).min(1).max(5), // Objetivos específicos (1-5)
});

// 4. Metodologia (desenvolvimento)
export const LessonPlanMethodologySchema = z.object({
  warmUp: z.string().optional(), // Introdução/Aquecimento (5-10 min)
  development: z.string(), // Desenvolvimento principal (30-40 min)
  closing: z.string().optional(), // Fechamento/Síntese (5-10 min)
  differentiation: z.string().optional(), // Diferenciação pedagógica (alunos com dificuldades)
});

// 5. Recursos didáticos
export const LessonPlanResourcesSchema = z.object({
  materials: z.array(z.string()).optional(), // Materiais necessários
  spaces: z.array(z.string()).optional(), // Espaços utilizados (sala, pátio, etc)
  technology: z.array(z.string()).optional(), // Recursos tecnológicos
});

// 6. Avaliação
export const LessonPlanEvaluationSchema = z.object({
  criteria: z.array(z.string()).min(1).max(5), // Critérios de avaliação (1-5)
  instruments: z.array(z.string()).optional(), // Instrumentos (observação, registro, etc)
  feedback: z.string().optional(), // Como dar feedback aos alunos
});

// Schema completo do conteúdo do plano
export const LessonPlanContentSchema = z.object({
  identification: LessonPlanIdentificationSchema.optional(),
  bnccSkills: z.array(BnccSkillDetailSchema).min(1).max(3), // 1-3 habilidades
  objectives: LessonPlanObjectivesSchema,
  methodology: LessonPlanMethodologySchema,
  resources: LessonPlanResourcesSchema.optional(),
  evaluation: LessonPlanEvaluationSchema,
});

// Schema para criação de plano (usado na API POST)
export const CreateLessonPlanSchema = z.object({
  title: z.string().min(5).max(200),
  numberOfClasses: z.number().int().min(1).max(3),
  educationLevelSlug: z.string(),

  // Bifurcação EI vs EF
  gradeSlug: z.string().optional(),
  subjectSlug: z.string().optional(),
  ageRange: z.string().optional(),
  fieldOfExperience: z.string().optional(),

  // Códigos BNCC selecionados (wizard Step 6)
  bnccSkillCodes: z.array(z.string()).min(1).max(3),

  // Conteúdo gerado pela IA (opcional no POST, será gerado)
  content: LessonPlanContentSchema.optional(),
});

// Schema de resposta da API
export const LessonPlanResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  numberOfClasses: z.number(),
  duration: z.number(), // em minutos
  educationLevelSlug: z.string(),
  gradeSlug: z.string().optional(),
  subjectSlug: z.string().optional(),
  ageRange: z.string().optional(),
  fieldOfExperience: z.string().optional(),
  bnccSkillCodes: z.array(z.string()),
  content: LessonPlanContentSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Types inferidos
export type LessonPlanIdentification = z.infer<typeof LessonPlanIdentificationSchema>;
export type BnccSkillDetail = z.infer<typeof BnccSkillDetailSchema>;
export type LessonPlanObjectives = z.infer<typeof LessonPlanObjectivesSchema>;
export type LessonPlanMethodology = z.infer<typeof LessonPlanMethodologySchema>;
export type LessonPlanResources = z.infer<typeof LessonPlanResourcesSchema>;
export type LessonPlanEvaluation = z.infer<typeof LessonPlanEvaluationSchema>;
export type LessonPlanContent = z.infer<typeof LessonPlanContentSchema>;
export type CreateLessonPlan = z.infer<typeof CreateLessonPlanSchema>;
export type LessonPlanResponse = z.infer<typeof LessonPlanResponseSchema>;
