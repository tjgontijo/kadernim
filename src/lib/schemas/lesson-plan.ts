import { z } from 'zod';

/**
 * Habilidade BNCC completa (enriquecida)
 */
export const BnccSkillDetailSchema = z.object({
  code: z.string(),
  description: z.string(),
  unitTheme: z.string().describe('Tema da unidade (opcional, use string vazia se não houver)'),
  knowledgeObject: z.string().describe('Objeto de conhecimento (opcional, use string vazia se não houver)'),
});

export type BnccSkillDetail = z.infer<typeof BnccSkillDetailSchema>;

/**
 * Schema de etapa da metodologia (MVP)
 * Suporta tanto EF (teacherActions/studentActions) quanto EI (adultActions/childrenActions)
 */
const MethodologyStepSchema = z.object({
  stepTitle: z.string().describe('Nome da etapa (ex: Abertura, Atividade Principal, Sistematização)'),
  timeMinutes: z.number().describe('Tempo aproximado em minutos'),
  // EF: ações do professor/aluno
  teacherActions: z.array(z.string()).describe('O que o professor faz (EF). Se for EI, retorne um array vazio.'),
  studentActions: z.array(z.string()).describe('O que os alunos fazem (EF). Se for EI, retorne um array vazio.'),
  // EI: ações do adulto/crianças
  adultActions: z.array(z.string()).describe('O que o adulto faz (EI). Se for EF, retorne um array vazio.'),
  childrenActions: z.array(z.string()).describe('O que as crianças fazem (EI). Se for EF, retorne um array vazio.'),
  // Comum
  materials: z.array(z.string()).describe('Materiais específicos deste bloco'),
  expectedOutput: z.string().describe('Produto ou evidência esperada desta etapa (pode ser string vazia)'),
});

/**
 * Schema MVP do conteúdo do plano de aula
 * USADO PARA GERAÇÃO POR IA
 */
export const LessonPlanContentSchema = z.object({
  title: z.string().describe('Título criativo e simples para a aula'),
  objective: z.string().describe('O que o aluno deve aprender (1 frase com verbo de ação)'),

  // EF usa knowledgeObject, EI usa theme
  knowledgeObject: z.string().describe('Objeto de conhecimento (EF). Se for EI, retorne string vazia.'),
  theme: z.string().describe('Tema central / conteúdo da experiência (EI). Se for EF, retorne string vazia.'),

  mainSkillCode: z.string().describe('Código da habilidade principal (ex: EF03MA09)'),
  complementarySkillCodes: z.array(z.string()).describe('Códigos complementares (máximo 2)'),

  // Apenas para EI
  rights: z.array(z.string()).describe('Direitos de aprendizagem (EI). Se for EF, retorne um array vazio.'),

  successCriteria: z.array(z.string()).describe('2 a 3 pontos que mostram que o aluno aprendeu'),

  methodology: z.array(MethodologyStepSchema).min(3).max(3),

  evaluation: z.object({
    instrument: z.string().describe('Como o professor vai verificar a aprendizagem'),
    criteria: z.array(z.string()).describe('Critérios de aprendizagem (2-3 itens)'),
  }),

  notes: z.string().describe('Dica rápida de ouro para o professor'),
});

/**
 * Schema Completo (incluindo campos legados)
 * USADO PARA PERSISTÊNCIA E VIEW
 */
export const FullLessonPlanContentSchema = LessonPlanContentSchema.extend({
  // Campos que podem vir de registros antigos sem todas as propriedades novas
  knowledgeObject: z.string().default(''),
  theme: z.string().default(''),
  rights: z.array(z.string()).default([]),

  // Metodologia com defaults para campos opcionais em registros antigos
  methodology: z.array(
    MethodologyStepSchema.extend({
      teacherActions: z.array(z.string()).default([]),
      studentActions: z.array(z.string()).default([]),
      adultActions: z.array(z.string()).default([]),
      childrenActions: z.array(z.string()).default([]),
      expectedOutput: z.string().default(''),
    })
  ).default([]),

  objectives: z.array(z.string()).default([]),
  competencies: z.array(z.string()).default([]),
  resources: z.array(z.string()).default([]),
  adaptations: z.string().default(''),
  references: z.array(z.string()).default([]),
});

// Schema para criação de plano (usado na API POST)
export const CreateLessonPlanSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  numberOfClasses: z.number().int().min(1).max(3),
  educationLevelSlug: z.string(),
  gradeSlug: z.string().optional(),
  subjectSlug: z.string().optional(),
  bnccSkillCodes: z.array(z.string()).min(1).max(3),
  intentRaw: z.string().optional(),
  skills: z.array(z.object({
    code: z.string(),
    role: z.enum(['main', 'complementary']),
  })).optional(),
});

// Schema de resposta da API
export const LessonPlanResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  numberOfClasses: z.number(),
  duration: z.number(),
  educationLevelSlug: z.string(),
  gradeSlug: z.string().optional(),
  subjectSlug: z.string().optional(),
  bnccSkillCodes: z.array(z.string()),
  content: FullLessonPlanContentSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type LessonPlanContent = z.infer<typeof LessonPlanContentSchema>;
export type FullLessonPlanContent = z.infer<typeof FullLessonPlanContentSchema>;
export type LessonPlanResponse = z.infer<typeof LessonPlanResponseSchema>;
export type CreateLessonPlan = z.infer<typeof CreateLessonPlanSchema>;
