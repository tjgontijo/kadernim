import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from 'docx'
import type { getQuestionBankRequestForUser } from './question-bank-request-service'

type RequestWithItems = NonNullable<Awaited<ReturnType<typeof getQuestionBankRequestForUser>>>
type RequestItem = RequestWithItems['items'][number]

export async function generateQuestionBankDocxBuffer(
  request: RequestWithItems,
  items: RequestItem[],
  titleOverride?: string
) {
  const title = titleOverride || `Lista de questoes - ${new Date(request.createdAt).toLocaleDateString('pt-BR')}`

  const children: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: title, bold: true })],
      spacing: { after: 260 },
    }),
    new Paragraph(`Quantidade solicitada: ${request.requestedCount}`),
    new Paragraph(`Quantidade selecionada: ${items.length}`),
    new Paragraph(''),
  ]

  items.forEach((item, index) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: `${index + 1}. ${item.question.prompt}`, bold: true })],
        spacing: { before: 180, after: 80 },
      })
    )

    if (item.question.instruction) children.push(new Paragraph(item.question.instruction))

    children.push(
      new Paragraph(`Tipo: ${item.question.questionType.name}`),
      new Paragraph(`Dificuldade: ${item.question.difficulty}`),
      new Paragraph(''),
      new Paragraph('Resposta: ________________________________________________'),
      new Paragraph(''),
      new Paragraph(''),
    )
  })

  children.push(new Paragraph(''))
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: 'Gabarito', bold: true })],
      spacing: { before: 320, after: 180 },
    })
  )

  items.forEach((item, index) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${index + 1}. ${JSON.stringify(item.question.answerKey)}`,
          }),
        ],
      })
    )
  })

  const doc = new Document({
    sections: [{ children }],
  })

  return Packer.toBuffer(doc)
}
