import { AdSlot } from '@/components/ads'
import { EducationLevelsTable } from '@/components/education-levels/EducationLevelsTable'

// Desabilitar cache
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function EducationLevelsPage() {
  return (
    <div className="container mx-auto px-4 py-4">
      <EducationLevelsTable />
      <AdSlot slot="footer" variant="minimal" />
    </div>
  )
}
