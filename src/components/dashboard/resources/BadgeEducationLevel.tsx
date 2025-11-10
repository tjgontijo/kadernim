import { Badge } from '@/components/ui/badge'

interface BadgeEducationLevelProps {
  level: string
}

const educationLevelLabels: Record<string, string> = {
  EARLY_CHILDHOOD_EDUCATION: 'Educação Infantil',
  ELEMENTARY_SCHOOL_I: 'Fundamental I',
  ELEMENTARY_SCHOOL_II: 'Fundamental II',
  HIGH_SCHOOL: 'Ensino Médio',
}

export function BadgeEducationLevel({ level }: BadgeEducationLevelProps) {
  const label = educationLevelLabels[level] || level

  return (
    <Badge variant="outline" className="text-xs font-normal">
      {label}
    </Badge>
  )
}
