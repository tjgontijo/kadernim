import { SubjectsTable } from '@/components/subjects/SubjectsTable'
import { PageHeader } from '@/components/layout/PageHeader'
import { BookOpen } from 'lucide-react'

// Desabilitar cache
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function SubjectsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Disciplinas" 
        icon={<BookOpen className="h-5 w-5" />}
      />
      <SubjectsTable />
    </div>
  )
}
