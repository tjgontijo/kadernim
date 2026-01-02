import { Badge } from '@/components/ui/badge'

interface BadgeSubjectProps {
  subject: string
}

const subjectLabels: Record<string, string> = {
  'lingua-portuguesa': 'Português',
  'matematica': 'Matemática',
  'ciencias': 'Ciências',
  'historia': 'História',
  'geografia': 'Geografia',
  'lingua-inglesa': 'Inglês',
  'arte': 'Arte',
  'educacao-fisica': 'Educação Física',
  'filosofia': 'Filosofia',
  'sociologia': 'Sociologia',
  'biologia': 'Biologia',
  'quimica': 'Química',
  'fisica': 'Física',
  'data-importante': 'Data Importante',
  'planejamento': 'Planejamento',
}

export function BadgeSubject({ subject }: BadgeSubjectProps) {
  const label = subjectLabels[subject] ?? subject

  return (
    <Badge variant="outline" className="text-xs font-normal">
      {label}
    </Badge>
  )
}
