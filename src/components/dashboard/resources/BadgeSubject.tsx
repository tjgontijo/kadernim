import { Badge } from '@/components/ui/badge'

interface BadgeSubjectProps {
  subject: string
}

const subjectLabels: Record<string, string> = {
  PORTUGUESE: 'Português',
  MATHEMATICS: 'Matemática',
  SCIENCE: 'Ciências',
  HISTORY: 'História',
  GEOGRAPHY: 'Geografia',
  ENGLISH: 'Inglês',
  ART: 'Arte',
  PHYSICAL_EDUCATION: 'Educação Física',
  PHILOSOPHY: 'Filosofia',
  SOCIOLOGY: 'Sociologia',
  BIOLOGY: 'Biologia',
  CHEMISTRY: 'Química',
  PHYSICS: 'Física',
  IMPORTANT_DATE: 'Data Importante',
  PLANNING: 'Planejamento',
}

export function BadgeSubject({ subject }: BadgeSubjectProps) {
  const label = subjectLabels[subject] || subject

  return (
    <Badge variant="outline" className="text-xs font-normal">
      {label}
    </Badge>
  )
}
