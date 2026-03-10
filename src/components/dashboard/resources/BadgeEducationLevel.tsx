import { Badge } from '@/components/ui/badge'

interface BadgeEducationLevelProps {
  level: string
}

const educationLevelLabels: Record<string, string> = {
  'educacao-infantil': 'Educação Infantil',
  'ensino-fundamental-1': 'Fundamental I',
  'ensino-fundamental-2': 'Fundamental II',
  'ensino-medio': 'Ensino Médio',
}

export function BadgeEducationLevel({ level }: BadgeEducationLevelProps) {
  const label = educationLevelLabels[level] ?? level

  return (
    <Badge variant="outline" className="text-xs font-normal">
      {label}
    </Badge>
  )
}
