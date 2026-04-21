import React from 'react'
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer'
import type { LessonPlanRecord } from '@/lib/lesson-plans/schemas'

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#1f1a17',
    lineHeight: 1.45,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 10,
  },
  meta: {
    fontSize: 10,
    color: '#5f5752',
    marginBottom: 3,
  },
  section: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
  },
  paragraph: {
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 3,
  },
  bullet: {
    width: 10,
  },
  stepCard: {
    borderWidth: 1,
    borderColor: '#ded6cf',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#f8f3ee',
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  stepTitle: {
    fontWeight: 700,
  },
  hint: {
    color: '#7b726a',
    fontSize: 9,
  },
})

function list(items: string[]) {
  return items.map((item, index) => (
    <View key={`${item}-${index}`} style={styles.bulletRow}>
      <Text style={styles.bullet}>•</Text>
      <Text>{item}</Text>
    </View>
  ))
}

function LessonPlanPdfDocument({ plan }: { plan: LessonPlanRecord }) {
  const content = plan.content
  const snapshot = plan.sourceSnapshot

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{plan.title}</Text>
        <Text style={styles.meta}>Recurso: {snapshot.title}</Text>
        <Text style={styles.meta}>Disciplina: {snapshot.subject.name}</Text>
        <Text style={styles.meta}>Etapa/Série: {snapshot.educationLevel.name} - {snapshot.grades.map((g) => g.name).join(', ') || 'Nao informada'}</Text>
        <Text style={styles.meta}>Duracao: {plan.durationMinutes} min ({plan.classCount ?? 1} aula)</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visao geral</Text>
          <Text style={styles.paragraph}>{content.overview}</Text>
          <Text style={styles.paragraph}>{content.objective}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BNCC</Text>
          {content.bncc.length > 0
            ? content.bncc.map((item) => (
                <Text key={item.code} style={styles.paragraph}>{item.code} - {item.description}</Text>
              ))
            : <Text style={styles.hint}>Nao informado</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Materiais</Text>
          {list(content.materials)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preparacao</Text>
          {list(content.preparation)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Desenvolvimento</Text>
          {content.flow.map((step, index) => (
            <View key={`${step.title}-${index}`} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text>{step.durationMinutes} min</Text>
              </View>
              <Text style={styles.hint}>Acoes da professora</Text>
              {list(step.teacherActions)}
              <Text style={styles.hint}>Acoes dos alunos</Text>
              {list(step.studentActions)}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avaliacao</Text>
          {list(content.assessment.evidence)}
          <Text style={styles.paragraph}>Pergunta rapida: {content.assessment.quickCheck}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adaptacoes</Text>
          <Text style={styles.paragraph}>Menos tempo: {content.adaptations.lessTime}</Text>
          <Text style={styles.paragraph}>Mais desafio: {content.adaptations.moreDifficulty}</Text>
          <Text style={styles.paragraph}>Trabalho em grupo: {content.adaptations.groupWork}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observacoes</Text>
          <Text style={styles.paragraph}>{plan.teacherNote || content.teacherNotes || 'Sem observacoes adicionais.'}</Text>
        </View>
      </Page>
    </Document>
  )
}

export async function generateLessonPlanPdfBuffer(plan: LessonPlanRecord) {
  return renderToBuffer(<LessonPlanPdfDocument plan={plan} />)
}
