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

// 2. Habilidade BNCC completa (enriquecida) - NÃO usado na geração IA
// Mantido para compatibilidade com o banco de dados
export const BnccSkillDetailSchema = z.object({
  code: z.string(), // EF03MA09
  description: z.string(), // Descrição completa da habilidade
  unitTheme: z.string().default(''), // Unidade temática (EF)
  knowledgeObject: z.string().default(''), // Objeto de conhecimento (EF)
  fieldOfExperience: z.string().default(''), // Campo de experiência (EI)
});

// 3. Objetivos de aprendizagem
export const LessonPlanObjectivesSchema = z.object({
  general: z.string(), // Objetivo geral da aula
  specific: z.array(z.string()).min(1).max(5), // Objetivos específicos (1-5)
});

// 4. Metodologia (desenvolvimento)
// TODOS OS CAMPOS OBRIGATÓRIOS para compatibilidade com OpenAI strict schema
export const LessonPlanMethodologySchema = z.object({
  warmUp: z.string(), // Introdução/Aquecimento (5-10 min) - OBRIGATÓRIO
  development: z.string(), // Desenvolvimento principal (30-40 min)
  closing: z.string(), // Fechamento/Síntese (5-10 min) - OBRIGATÓRIO
  differentiation: z.string(), // Diferenciação pedagógica (alunos com dificuldades) - OBRIGATÓRIO
});

// 5. Recursos didáticos
// TODOS OS CAMPOS OBRIGATÓRIOS para compatibilidade com OpenAI strict schema
export const LessonPlanResourcesSchema = z.object({
  materials: z.array(z.string()), // Materiais necessários - OBRIGATÓRIO (pode ser vazio [])
  spaces: z.array(z.string()), // Espaços utilizados (sala, pátio, etc) - OBRIGATÓRIO (pode ser vazio [])
  technology: z.array(z.string()), // Recursos tecnológicos - OBRIGATÓRIO (pode ser vazio [])
});

// 6. Avaliação
// TODOS OS CAMPOS OBRIGATÓRIOS para compatibilidade com OpenAI strict schema
export const LessonPlanEvaluationSchema = z.object({
  criteria: z.array(z.string()).min(1).max(5), // Critérios de avaliação (1-5)
  instruments: z.array(z.string()), // Instrumentos (observação, registro, etc) - OBRIGATÓRIO (pode ser vazio [])
  feedback: z.string(), // Como dar feedback aos alunos - OBRIGATÓRIO
});

// Schema completo do conteúdo do plano (gerado por IA)
// identification e bnccSkills foram removidos pois não precisam ser gerados pela IA
// (bnccSkills já vem do input do usuário)
export const LessonPlanContentSchema = z.object({
  objectives: LessonPlanObjectivesSchema,
  methodology: LessonPlanMethodologySchema,
  resources: LessonPlanResourcesSchema,
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
