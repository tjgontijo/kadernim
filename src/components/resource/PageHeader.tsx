import React from 'react'

interface PageHeaderProps {
  title: string
  subject: string
  year: string
  bnccCode: string
  teacherField?: boolean
  studentField?: boolean
  dateField?: boolean
  schoolField?: boolean
}

export function PageHeader({ title, subject, year, bnccCode, teacherField, studentField, dateField, schoolField }: PageHeaderProps) {
  return (
    <div className="pg-header">
      <div className="pg-header-top">
        <div className="pg-header-icon">📚</div>
        <div>
          <div className="pg-header-title">{title}</div>
          <div className="pg-header-meta">{subject} · {year} · {bnccCode}</div>
        </div>
      </div>
      {(studentField || teacherField || dateField || schoolField) && (
        <div className="pg-header-fields">
          {studentField && <div className="hf"><span className="hf-label">Aluno:</span><div className="hf-line" /></div>}
          {teacherField && <div className="hf"><span className="hf-label">Prof.:</span><div className="hf-line" /></div>}
          {dateField && <div className="hf"><span className="hf-label">Data:</span><div className="hf-line" /></div>}
          {schoolField && <div className="hf"><span className="hf-label">Escola:</span><div className="hf-line" /></div>}
        </div>
      )}
    </div>
  )
}
