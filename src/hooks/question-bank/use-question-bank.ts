'use client'

import { useMutation } from '@tanstack/react-query'
import {
  createQuestionBankRequest,
  createQuestionBankFeedback,
  exportQuestionBankDocx,
  exportQuestionBankGoogleDocs,
} from '@/lib/question-bank/api-client'

export function useQuestionBankRequest() {
  return useMutation({
    mutationFn: createQuestionBankRequest,
  })
}

export function useQuestionBankFeedback() {
  return useMutation({
    mutationFn: ({ questionId, input }: { questionId: string; input: any }) =>
      createQuestionBankFeedback(questionId, input),
  })
}

export function useQuestionBankDocxExport() {
  return useMutation({
    mutationFn: exportQuestionBankDocx,
  })
}

export function useQuestionBankGoogleDocsExport() {
  return useMutation({
    mutationFn: exportQuestionBankGoogleDocs,
  })
}
