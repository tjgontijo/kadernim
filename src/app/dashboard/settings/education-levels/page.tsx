import { EducationLevelsTable } from '@/components/education-levels/EducationLevelsTable'
import { PageHeader } from '@/components/layout/PageHeader'
import { School } from 'lucide-react'

// Desabilitar cache
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function EducationLevelsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Níveis de Ensino" 
        icon={<School className="h-5 w-5" />}
      />
      <EducationLevelsTable />
    </div>
  )
}
