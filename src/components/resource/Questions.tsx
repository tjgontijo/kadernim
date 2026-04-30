import React from 'react'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export function MultipleChoiceQuestion({ number, prompt, options }: {
  number: number; prompt: string; options: string[]
}) {
  return (
    <div className="question">
      <div className="q-header">
        <span className="q-number">{number}.</span>
        <span className="q-prompt">{prompt}</span>
      </div>
      <div className="mc-opts">
        {options.map((opt, i) => (
          <div key={i} className="mc-opt">
            <span className="mc-letter">{LETTERS[i]}</span>
            <span className="mc-text">{opt}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function OpenQuestion({ number, prompt, lines = 3, instruction }: {
  number: number; prompt: string; lines?: number; instruction?: string
}) {
  return (
    <div className="question">
      <div className="q-header">
        <span className="q-number">{number}.</span>
        <span className="q-prompt">{prompt}</span>
      </div>
      {instruction && <div className="q-instruction">{instruction}</div>}
      <div className="answer-lines">
        {Array.from({ length: lines }).map((_, i) => <div key={i} className="answer-line" />)}
      </div>
    </div>
  )
}

export function TrueFalseQuestion({ number, prompt, statements }: {
  number: number; prompt: string; statements: string[]
}) {
  return (
    <div className="question">
      <div className="q-header">
        <span className="q-number">{number}.</span>
        <span className="q-prompt">{prompt}</span>
      </div>
      <div className="tf-list">
        {statements.map((s, i) => (
          <div key={i} className="tf-item">
            <div className="tf-bubble">V</div>
            <div className="tf-bubble">F</div>
            <span className="tf-text">{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FillBlankQuestion({ number, prompt, wordBank, sentenceTemplate }: {
  number: number; prompt: string; wordBank?: string[]; sentenceTemplate: string
}) {
  const parts = sentenceTemplate.split('___')
  return (
    <div className="question">
      <div className="q-header">
        <span className="q-number">{number}.</span>
        <span className="q-prompt">{prompt}</span>
      </div>
      {wordBank && wordBank.length > 0 && (
        <div className="fb-bank">
          {wordBank.map((w, i) => <span key={i} className="fb-word">{w}</span>)}
        </div>
      )}
      <div className="fb-sent">
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {part}
            {i < parts.length - 1 && <span className="fb-blank" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export function MatchingQuestion({ number, prompt, leftItems, rightItems }: {
  number: number; prompt: string; leftItems: string[]; rightItems: string[]
}) {
  return (
    <div className="question">
      <div className="q-header">
        <span className="q-number">{number}.</span>
        <span className="q-prompt">{prompt}</span>
      </div>
      <div className="match-grid">
        <div className="match-col">
          {leftItems.map((item, i) => (
            <div key={i} className="match-item-wrap">
              <span className="match-ltr">{LETTERS[i]}</span>
              <span className="match-pill">{item}</span>
            </div>
          ))}
        </div>
        <div className="match-dots-col">
          {leftItems.map((_, i) => <div key={i} className="match-circle" />)}
        </div>
        <div className="match-col">
          {rightItems.map((item, i) => (
            <div key={i} className="match-item-wrap">
              <span className="match-ltr">{i + 1}.</span>
              <span className="match-pill">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function OrderingQuestion({ number, prompt, items }: {
  number: number; prompt: string; items: string[]
}) {
  return (
    <div className="question">
      <div className="q-header">
        <span className="q-number">{number}.</span>
        <span className="q-prompt">{prompt}</span>
      </div>
      <div className="order-list">
        {items.map((item, i) => (
          <div key={i} className="order-item">
            <div className="order-bubble" />
            <span className="order-text">{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CalculationQuestion({ number, prompt, developmentLines = 4, hasAnswerLine = true }: {
  number: number; prompt: string; developmentLines?: number; hasAnswerLine?: boolean
}) {
  return (
    <div className="question">
      <div className="q-header">
        <span className="q-number">{number}.</span>
        <span className="q-prompt">{prompt}</span>
      </div>
      <div className="calc-dev-label">Desenvolvimento:</div>
      <div className="calc-dev-area" style={{ height: `${developmentLines * 24}px` }} />
      {hasAnswerLine && (
        <div className="calc-ans">
          <span className="calc-ans-label">Resposta:</span>
          <div className="calc-ans-line" />
        </div>
      )}
    </div>
  )
}
