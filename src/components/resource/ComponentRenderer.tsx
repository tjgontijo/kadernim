import React from 'react'
import { Component } from '@/lib/resource/schemas'
import { PageHeader } from './PageHeader'
import { PageFooter } from './PageFooter'
import {
  MultipleChoiceQuestion,
  OpenQuestion,
  TrueFalseQuestion,
  FillBlankQuestion,
  MatchingQuestion,
  OrderingQuestion,
  CalculationQuestion,
} from './Questions'
import {
  StoryBlock,
  ConceptBox,
  TipBox,
  VocabularyBox,
  ActivityIntro,
  ChallengeBox,
  DividerSection,
  SelfAssessment,
} from './ContentBlocks'

interface ComponentRendererProps {
  component: Component
}

export function ComponentRenderer({ component }: ComponentRendererProps) {
  switch (component.type) {
    case 'page_header':
      return (
        <PageHeader
          title={component.title}
          subject={component.subject}
          year={component.year}
          bnccCode={component.bnccCode}
          teacherField={component.teacherField}
          studentField={component.studentField}
          dateField={component.dateField}
          schoolField={component.schoolField}
        />
      )

    case 'page_footer':
      return (
        <PageFooter
          bnccSkill={component.bnccSkill}
          competencyArea={component.competencyArea}
          pageNumber={component.pageNumber}
        />
      )

    case 'story_block':
      return (
        <StoryBlock
          storyText={component.storyText}
          imagePlaceholder={component.imagePlaceholder}
          learningPoint={component.learningPoint}
        />
      )

    case 'concept_box':
      return (
        <ConceptBox
          term={component.term}
          definition={component.definition}
        />
      )

    case 'tip_box':
      return (
        <TipBox
          tipText={component.tipText}
        />
      )

    case 'vocabulary_box':
      return (
        <VocabularyBox
          items={component.items}
        />
      )

    case 'activity_intro':
      return (
        <ActivityIntro
          instructionText={component.instructionText}
          bodyText={component.bodyText}
          source={component.source}
        />
      )

    case 'multiple_choice':
      return (
        <MultipleChoiceQuestion
          number={component.number}
          prompt={component.prompt}
          options={component.options}
        />
      )

    case 'open_short':
      return (
        <OpenQuestion
          number={component.number}
          prompt={component.prompt}
          lines={2}
        />
      )

    case 'open_long':
      return (
        <OpenQuestion
          number={component.number}
          prompt={component.prompt}
          lines={4}
        />
      )

    case 'true_false':
      return (
        <TrueFalseQuestion
          number={component.number}
          prompt={component.prompt}
          statements={component.statements}
        />
      )

    case 'fill_blank':
      return (
        <FillBlankQuestion
          number={component.number}
          prompt={component.prompt}
          wordBank={component.wordBank}
          sentenceTemplate={component.sentenceTemplate}
        />
      )

    case 'matching':
      return (
        <MatchingQuestion
          number={component.number}
          prompt={component.prompt}
          leftItems={component.leftItems}
          rightItems={component.rightItems}
        />
      )

    case 'ordering':
      return (
        <OrderingQuestion
          number={component.number}
          prompt={component.prompt}
          items={component.items}
        />
      )

    case 'calculation':
      return (
        <CalculationQuestion
          number={component.number}
          prompt={component.prompt}
          developmentLines={component.developmentLines}
          hasAnswerLine={component.hasAnswerLine}
        />
      )

    case 'comprehension':
      return (
        <OpenQuestion
          number={component.number}
          prompt={component.prompt}
          lines={component.lines}
        />
      )

    case 'reasoning':
      return (
        <OpenQuestion
          number={component.number}
          prompt={component.prompt}
          lines={component.lines}
        />
      )

    case 'creation':
      return (
        <OpenQuestion
          number={component.number}
          prompt={component.prompt}
          lines={component.lines}
        />
      )

    case 'challenge_box':
      return (
        <ChallengeBox
          challengeText={component.challengeText}
          lines={component.lines}
        />
      )

    case 'divider_section':
      return (
        <DividerSection
          sectionTitle={component.sectionTitle}
        />
      )

    case 'self_assessment':
      return (
        <SelfAssessment
          title={component.title}
          items={component.items}
        />
      )

    // Unimplemented types
    case 'timeline':
    case 'data_table':
    case 'image_placeholder':
    default:
      return (
        <div style={{
          padding: '12px',
          background: '#FEE2E2',
          border: '1px solid #FCA5A5',
          borderRadius: '6px',
          color: '#991B1B',
          fontSize: '12px',
          marginBottom: '16px',
        }}>
          Componente não implementado: {component.type}
        </div>
      )
  }
}
