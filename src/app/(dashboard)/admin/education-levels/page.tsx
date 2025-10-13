import { AdSlot } from '@/components/ads'
import { EducationLevelsTable } from '@/components/education-levels/EducationLevelsTable'
import { PageHeader } from '@/components/layout/PageHeader'
import { School } from 'lucide-react'

// Desabilitar cache
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function EducationLevelsPage() {
  return (
    <>
      <PageHeader 
      title="Níveis de Ensino" 
      icon={<School className="h-5 w-5" />}
      backHref="/settings" 
      />      
      <div className="px-4 pb-3 pt-0">
        <AdSlot slot="header" variant="compact" />
      </div>
      
      <div className="container mx-auto px-4 py-4">
        <EducationLevelsTable />
      </div>
    </>
  )
}
