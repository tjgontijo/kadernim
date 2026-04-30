import React from 'react'

export function PageFooter({ bnccSkill, competencyArea, pageNumber }: {
  bnccSkill: string
  competencyArea: string
  pageNumber: number
}) {
  return (
    <div className="pg-footer">
      <span className="pg-footer-skill">{bnccSkill} · {competencyArea}</span>
      <span className="pg-footer-page">Pág. {pageNumber}</span>
    </div>
  )
}
