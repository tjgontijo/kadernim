import { SubjectsTable } from '@/components/subjects/SubjectsTable'
import { PageHeader } from '@/components/layout/PageHeader'
import { BookOpen } from 'lucide-react'

// Desabilitar cache
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function SubjectsPage() {
  return (
    <>
      <PageHeader 
        title="Disciplinas" 
        icon={<BookOpen className="h-5 w-5" />}
        backHref="/settings"
      />
      
      <div className="container mx-auto px-4 py-4">
        <SubjectsTable />
      </div>
    </>
  )
}
