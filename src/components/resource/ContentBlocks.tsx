import React from 'react'

export function StoryBlock({ storyText, imagePlaceholder, learningPoint }: {
  storyText: string
  imagePlaceholder?: string
  learningPoint: string
}) {
  return (
    <div className="story-block">
      <div className="act-intro-body">{storyText}</div>
      {imagePlaceholder && (
        <div className="img-placeholder" style={{ marginTop: '10px' }}>
          <div className="img-ph-icon">🖼️</div>
          <div className="img-ph-caption">{imagePlaceholder}</div>
        </div>
      )}
      {learningPoint && (
        <div className="box-title" style={{ marginTop: '10px', color: 'var(--subject-dark)' }}>
          🌱 {learningPoint}
        </div>
      )}
    </div>
  )
}

export function ConceptBox({ term, definition }: { term: string; definition: string }) {
  return (
    <div className="box box-concept">
      <div className="box-hd">
        <span className="box-icon">💡</span>
        <span className="box-title">Conceito</span>
      </div>
      <div className="box-divider" />
      <div className="box-term">{term}</div>
      <div className="box-def">{definition}</div>
    </div>
  )
}

export function TipBox({ tipText }: { tipText: string }) {
  return (
    <div className="box box-tip">
      <div className="box-hd">
        <span className="box-icon">📌</span>
        <span className="box-title">Dica</span>
      </div>
      <div className="box-divider" />
      <div className="box-def">{tipText}</div>
    </div>
  )
}

export function VocabularyBox({ items }: { items: Array<{ term: string; definition: string }> }) {
  return (
    <div className="box box-vocab">
      <div className="box-hd">
        <span className="box-icon">📖</span>
        <span className="box-title">Vocabulário</span>
      </div>
      <div className="box-divider" />
      <ul className="vocab-list">
        {items.map((item, i) => (
          <li key={i} className="vocab-item">
            <span className="vocab-term">{item.term}</span>
            <span className="vocab-sep">→</span>
            <span className="vocab-def">{item.definition}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ActivityIntro({ instructionText, bodyText, source }: {
  instructionText: string
  bodyText: string
  source?: string
}) {
  return (
    <div className="act-intro">
      {instructionText && <div className="act-intro-instruction">{instructionText}</div>}
      <div className="act-intro-body">{bodyText}</div>
      {source && <div className="act-intro-source">Fonte: {source}</div>}
    </div>
  )
}

export function ChallengeBox({ challengeText, lines = 3 }: { challengeText: string; lines?: number }) {
  return (
    <div className="challenge">
      <div className="box-hd">
        <span className="box-icon">🏆</span>
        <span className="box-title" style={{ color: '#92400E' }}>Desafio</span>
      </div>
      <div className="box-def" style={{ marginTop: '8px' }}>{challengeText}</div>
      <div className="answer-lines" style={{ marginTop: '10px' }}>
        {Array.from({ length: lines }).map((_, i) => <div key={i} className="answer-line" />)}
      </div>
    </div>
  )
}

export function DividerSection({ sectionTitle }: { sectionTitle: string }) {
  return (
    <div className="section-divider">
      <div className="divider-line" />
      <span className="divider-label">{sectionTitle}</span>
      <div className="divider-line" />
    </div>
  )
}

export function SelfAssessment({ title, items }: { title?: string; items: string[] }) {
  return (
    <div className="box box-concept" style={{ borderColor: 'var(--subject-main)', backgroundColor: '#fdfdfd' }}>
      <div className="box-hd">
        <span className="box-icon">✅</span>
        <span className="box-title">{title || 'Autoavaliação'}</span>
      </div>
      <div className="box-divider" />
      <div style={{ marginTop: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid var(--subject-main)', width: '70%' }}>Critério</th>
              <th style={{ textAlign: 'center', padding: '8px', borderBottom: '2px solid var(--subject-main)' }}>Sim</th>
              <th style={{ textAlign: 'center', padding: '8px', borderBottom: '2px solid var(--subject-main)' }}>Não</th>
              <th style={{ textAlign: 'center', padding: '8px', borderBottom: '2px solid var(--subject-main)' }}>Em partes</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>{item}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid #ccc', margin: '0 auto' }} />
                </td>
                <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid #ccc', margin: '0 auto' }} />
                </td>
                <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid #ccc', margin: '0 auto' }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
