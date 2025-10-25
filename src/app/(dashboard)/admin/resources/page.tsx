// Página de listagem de recursos

import { ResourcesTable } from '@/components/resources/ResourcesTable'

// Desabilitar cache
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function ResourcesPage() {
  return (
    <div className="container mx-auto px-4 py-4">
      <ResourcesTable />
    </div>
  )
}
