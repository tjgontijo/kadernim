import { z } from 'zod';

/**
 * Schema para o conteúdo estruturado do plano de aula (campo content em LessonPlan)
 *
 * Estrutura baseada em boas práticas pedagógicas BNCC
 */

// 1. Identificação do plano (REMOVIDO da geração IA - preenchido pelo usuário)
// Mantido para compatibilidade futura, mas não usado na geração
export const LessonPlanIdentificationSchema = z.object({
  school: z.string().optional(), // Nome da escola
  teacher: z.string().optional(), // Nome do professor
  class: z.string().optional(), // Turma (ex: "3º Ano A")
  date: z.string().optional(), // Data prevista (YYYY-MM-DD)
}).optional();

// 2. Habilidade BNCC completa (enriquecida) - Usado para contextualizar o prompt da IA
export const BnccSkillDetailSchema = z.object({
  code: z.string(), // EF03MA09
  description: z.string(), // Descrição completa da habilidade
  unitTheme: z.string().default(''), // Unidade temática (EF)
  knowledgeObject: z.string().default(''), // Objeto de conhecimento (EF)
  fieldOfExperience: z.string().default(''), // Campo de experiência (EI)
  comments: z.string().default(''), // Comentários pedagógicos da BNCC
  curriculumSuggestions: z.string().default(''), // Sugestões curriculares
});

// Schema completo do conteúdo do plano (gerado por IA)
export const LessonPlanContentSchema = z.object({
  // 2. Objeto de conhecimento (Substantivo, sem verbo)
  knowledgeObject: z.string().describe('Conteúdo/tema central, expresso como substantivo, sem verbos'),

  // 4. Objetivos de aprendizagem (Verbo no infinitivo, observável)
  objectives: z.array(z.string()).min(1).max(5).describe('Objetivos claros iniciando com verbos no infinitivo'),

  // 5. Competências (Número e resumo)
  competencies: z.array(z.string()).min(1).max(5).describe('Competências gerais ou específicas da BNCC envolvidas'),

  // 6. Metodologia (Passo a passo, verbos no infinitivo)
  methodology: z.array(
    z.object({
      step: z.string(),
      description: z.string(),
    })
  ).min(3).describe('Sequência didática passo a passo com verbos no infinitivo'),

  // 7. Recursos didáticos (Lista objetiva)
  resources: z.array(z.string()).min(1).describe('Materiais necessários para a aula'),

  // 8. Avaliação (Como e quando)
  evaluation: z.string().describe('Critérios e instrumentos de avaliação relacionados aos objetivos'),

  // 9. Adequações e inclusão (Estratégias concretas)
  adaptations: z.string().describe('Estratégias para alunos com necessidades específicas ou dificuldades'),

  // 10. Referências (BNCC e materiais)
  references: z.array(z.string()).min(1).describe('Fontes legais e materiais didáticos utilizados'),
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
export type LessonPlanContent = z.infer<typeof LessonPlanContentSchema>;
export type CreateLessonPlan = z.infer<typeof CreateLessonPlanSchema>;
export type LessonPlanResponse = z.infer<typeof LessonPlanResponseSchema>;
