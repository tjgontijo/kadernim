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
  // Campos de Experiência (EI)
  'eu-outro-nos': 'O eu, o outro e o nós',
  'corpo-gestos-movimentos': 'Corpo, gestos e movimentos',
  'tracos-sons-cores-formas': 'Traços, sons, cores e formas',
  'escuta-fala-pensamento-imaginacao': 'Escuta, fala, pensamento e imaginação',
  'espacos-tempos-quantidades-relacoes-transformacoes': 'Espaços, tempos, quantidades, relações e transformações',
}

export function BadgeSubject({ subject }: BadgeSubjectProps) {
  const label = subjectLabels[subject] ?? subject

  return (
    <Badge variant="outline" className="text-xs font-normal">
      {label}
    </Badge>
  )
}
