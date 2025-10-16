import { SubjectsTable } from '@/components/subjects/SubjectsTable'

// Desabilitar cache
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function SubjectsPage() {
  return (
    <div className="container mx-auto px-4 py-4">
      <SubjectsTable />
    </div>
  )
}
