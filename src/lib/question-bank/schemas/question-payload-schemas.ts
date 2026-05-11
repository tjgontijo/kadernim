import { z } from 'zod'

const AlternativeIdSchema = z.enum(['A', 'B', 'C', 'D', 'E'])

export const MultipleChoicePayloadSchema = z.object({
  instruction: z.string().trim().min(1).max(300).optional(),
  alternatives: z.array(
    z.object({
      id: AlternativeIdSchema,
      text: z.string().trim().min(1).max(400),
    })
  ).min(4).max(5),
})

export const MultipleChoiceAnswerKeySchema = z.object({
  correctAlternativeId: AlternativeIdSchema,
})

export const MultipleSelectPayloadSchema = MultipleChoicePayloadSchema

export const MultipleSelectAnswerKeySchema = z.object({
  correctAlternativeIds: z.array(AlternativeIdSchema).min(2).max(5),
})

export const TrueFalsePayloadSchema = z.object({
  statements: z.array(
    z.object({
      id: z.string().trim().min(1).max(50),
      text: z.string().trim().min(1).max(500),
    })
  ).min(2).max(8),
})

export const TrueFalseAnswerKeySchema = z.object({
  answers: z.array(
    z.object({
      id: z.string().trim().min(1).max(50),
      value: z.boolean(),
      explanation: z.string().trim().max(500).optional(),
    })
  ).min(2).max(8),
})

export const FillBlankPayloadSchema = z.object({
  textWithBlanks: z.string().trim().min(1).max(3000),
  wordBank: z.array(z.string().trim().min(1).max(100)).min(2).max(20).optional(),
})

export const FillBlankAnswerKeySchema = z.object({
  answers: z.array(z.string().trim().min(1).max(200)).min(1).max(20),
})

export const MatchingPayloadSchema = z.object({
  left: z.array(z.object({ id: z.string().trim().min(1).max(50), text: z.string().trim().min(1).max(300) })).min(2).max(10),
  right: z.array(z.object({ id: z.string().trim().min(1).max(50), text: z.string().trim().min(1).max(300) })).min(2).max(10),
})

export const MatchingAnswerKeySchema = z.object({
  pairs: z.array(
    z.object({
      leftId: z.string().trim().min(1).max(50),
      rightId: z.string().trim().min(1).max(50),
    })
  ).min(2).max(10),
})

export const OrderingPayloadSchema = z.object({
  items: z.array(z.object({ id: z.string().trim().min(1).max(50), text: z.string().trim().min(1).max(300) })).min(3).max(10),
  criterion: z.string().trim().max(200).optional(),
})

export const OrderingAnswerKeySchema = z.object({
  orderedItemIds: z.array(z.string().trim().min(1).max(50)).min(3).max(10),
})

export const ClassificationPayloadSchema = z.object({
  items: z.array(z.object({ id: z.string().trim().min(1).max(50), text: z.string().trim().min(1).max(300) })).min(2).max(20),
  categories: z.array(z.object({ id: z.string().trim().min(1).max(50), label: z.string().trim().min(1).max(120) })).min(2).max(8),
})

export const ClassificationAnswerKeySchema = z.object({
  classifications: z.array(
    z.object({
      itemId: z.string().trim().min(1).max(50),
      categoryId: z.string().trim().min(1).max(50),
    })
  ).min(2).max(20),
})

export const OpenTextPayloadSchema = z.object({
  answerLines: z.number().int().min(2).max(12),
  instruction: z.string().trim().max(300).optional(),
})

export const OpenTextAnswerKeySchema = z.object({
  expectedAnswer: z.string().trim().min(1).max(3000),
  rubric: z.array(z.string().trim().min(1).max(300)).min(1).max(12),
})

export const ShortAnswerPayloadSchema = z.object({
  expectedFormat: z.enum(['word', 'phrase', 'sentence']).optional(),
})

export const ShortAnswerAnswerKeySchema = z.object({
  expectedAnswer: z.string().trim().min(1).max(500),
  aliases: z.array(z.string().trim().min(1).max(200)).max(12).optional(),
  caseSensitive: z.boolean().optional(),
})

export const TableInterpretationPayloadSchema = z.object({
  tableTitle: z.string().trim().min(1).max(200),
  columns: z.array(z.string().trim().min(1).max(80)).min(2).max(8),
  rows: z.array(z.array(z.string().trim().max(200)).min(2).max(8)).min(1).max(20),
  answerMode: z.enum(['short_answer', 'multiple_choice', 'open_text']),
  answerPayload: z.unknown().optional(),
})

export const TableInterpretationAnswerKeySchema = z.object({
  expectedAnswer: z.string().trim().max(1000).optional(),
  correctAlternativeId: AlternativeIdSchema.optional(),
  rubric: z.array(z.string().trim().min(1).max(300)).max(10).optional(),
})

export const ReadingContextPayloadSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(5000),
  source: z.string().trim().max(200).optional(),
})
