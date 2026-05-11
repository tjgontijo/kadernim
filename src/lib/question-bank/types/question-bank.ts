export interface QuestionBankTypeSeedItem {
  code: string
  name: string
  description?: string
  sortOrder?: number
  isActive?: boolean
}

export interface QuestionBankSourceSeedItem {
  code: string
  name: string
  description?: string
  sortOrder?: number
  isActive?: boolean
}

export const QUESTION_BANK_TYPE_SEEDS: QuestionBankTypeSeedItem[] = [
  { code: 'multiple_choice', name: 'Multipla escolha', description: 'Uma alternativa correta.', sortOrder: 10 },
  { code: 'multiple_select', name: 'Multipla selecao', description: 'Duas ou mais alternativas corretas.', sortOrder: 20 },
  { code: 'true_false', name: 'Verdadeiro ou falso', description: 'Lista de afirmativas V/F.', sortOrder: 30 },
  { code: 'fill_blank', name: 'Complete a lacuna', description: 'Preenchimento de lacunas com ou sem banco.', sortOrder: 40 },
  { code: 'matching', name: 'Ligar colunas', description: 'Pareamento entre colunas.', sortOrder: 50 },
  { code: 'ordering', name: 'Ordenar', description: 'Ordenacao de itens por criterio.', sortOrder: 60 },
  { code: 'classification', name: 'Classificacao', description: 'Classifica itens em categorias.', sortOrder: 70 },
  { code: 'open_text', name: 'Aberta / dissertativa', description: 'Resposta discursiva com rubrica.', sortOrder: 80 },
  { code: 'short_answer', name: 'Resposta curta', description: 'Resposta objetiva curta.', sortOrder: 90 },
  { code: 'table_interpretation', name: 'Interpretacao de tabela', description: 'Leitura de tabela simples.', sortOrder: 100 },
]

export const QUESTION_BANK_SOURCE_SEEDS: QuestionBankSourceSeedItem[] = [
  { code: 'ai', name: 'Gerada por IA', description: 'Questao gerada por pipeline Mastra/LLM.', sortOrder: 10 },
  { code: 'admin', name: 'Criada por admin', description: 'Questao criada manualmente pela equipe.', sortOrder: 20 },
  { code: 'import', name: 'Importada', description: 'Questao importada por carga externa.', sortOrder: 30 },
  { code: 'reused', name: 'Reaproveitada', description: 'Origem de item retornado para request sem nova geracao.', sortOrder: 40 },
]
