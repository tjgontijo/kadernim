import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from 'docx'
import type { LessonPlanRecord } from '@/lib/lesson-plans/schemas'

function bulletList(items: string[]) {
  return items.map((item) =>
    new Paragraph({
      text: item,
      bullet: { level: 0 },
      spacing: { after: 80 },
    })
  )
}

function sectionTitle(text: string) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 220, after: 120 },
  })
}

export async function generateLessonPlanDocxBuffer(plan: LessonPlanRecord) {
  const content = plan.content
  const snapshot = plan.sourceSnapshot

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun({ text: plan.title, bold: true })],
            spacing: { after: 220 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Recurso', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph(snapshot.title)] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Disciplina', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph(snapshot.subject.name)] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Etapa/Série', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph(`${snapshot.educationLevel.name} - ${snapshot.grades.map((grade) => grade.name).join(', ') || 'Nao informada'}`)] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Duração', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph(`${plan.durationMinutes} minutos (${plan.classCount ?? 1} aula)`)] }),
                ],
              }),
            ],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: 'D5CDC7' },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D5CDC7' },
              left: { style: BorderStyle.SINGLE, size: 1, color: 'D5CDC7' },
              right: { style: BorderStyle.SINGLE, size: 1, color: 'D5CDC7' },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E4DDD8' },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E4DDD8' },
            },
          }),

          sectionTitle('Visão geral'),
          new Paragraph(content.overview),
          new Paragraph(content.objective),

          sectionTitle('BNCC'),
          ...(content.bncc.length > 0
            ? content.bncc.map((skill) => new Paragraph(`${skill.code} - ${skill.description}`))
            : [new Paragraph('Nao informado')]),

          sectionTitle('Materiais'),
          ...bulletList(content.materials),

          sectionTitle('Preparação'),
          ...bulletList(content.preparation),

          sectionTitle('Desenvolvimento'),
          ...content.flow.flatMap((step) => [
            new Paragraph({
              children: [new TextRun({ text: `${step.title} (${step.durationMinutes} min)`, bold: true })],
              spacing: { before: 120, after: 80 },
            }),
            new Paragraph({ children: [new TextRun({ text: 'Professora:', bold: true })] }),
            ...bulletList(step.teacherActions),
            new Paragraph({ children: [new TextRun({ text: 'Alunos:', bold: true })] }),
            ...bulletList(step.studentActions),
          ]),

          sectionTitle('Avaliação'),
          ...bulletList(content.assessment.evidence),
          new Paragraph(`Pergunta rápida: ${content.assessment.quickCheck}`),

          sectionTitle('Adaptações'),
          new Paragraph(`Menos tempo: ${content.adaptations.lessTime}`),
          new Paragraph(`Mais dificuldade: ${content.adaptations.moreDifficulty}`),
          new Paragraph(`Trabalho em grupo: ${content.adaptations.groupWork}`),

          sectionTitle('Observações'),
          new Paragraph(plan.teacherNote || content.teacherNotes || 'Sem observacoes adicionais.'),
        ],
      },
    ],
  })

  return Packer.toBuffer(doc)
}
