import { Badge } from '@/components/ui/badge'

interface BadgeSubjectProps {
  subject: string
  color?: string | null
  textColor?: string | null
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
  'ensino-religioso': 'Ensino Religioso',
  'data-importante': 'Data Importante',
  'planejamento': 'Planejamento',
  // Campos de Experiência (EI)
  'eu-outro-nos': 'O eu, o outro e o nós',
  'corpo-gestos-movimentos': 'Corpo, gestos e movimentos',
  'tracos-sons-cores-formas': 'Traços, sons, cores e formas',
  'escuta-fala-pensamento': 'Escuta, fala, pensamento e imaginação',
  'espacos-tempos-quantidades': 'Espaços, tempos, quantidades, relações e transformações',
}

const subjectVariants: Record<string, any> = {
  'lingua-portuguesa': 'port',
  'matematica': 'mat',
  'ciencias': 'cien',
  'historia': 'hist',
  'geografia': 'geo',
  'lingua-inglesa': 'ingles',
  'arte': 'arte',
  'educacao-fisica': 'edfis',
}

export function BadgeSubject({ subject, color, textColor }: BadgeSubjectProps) {
  const label = subjectLabels[subject] ?? subject
  const variant = subjectVariants[subject] || 'outline'

  const style = color ? { 
    backgroundColor: color, 
    color: textColor || 'var(--ink)',
    borderColor: 'transparent'
  } : {}

  return (
    <Badge variant={variant} style={style}>
      {label}
    </Badge>
  )
}
