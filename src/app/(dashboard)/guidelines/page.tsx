'use client'

import { useCallback, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { PageScaffold } from '@/components/dashboard/shared/page-scaffold'
import { BnccFilters } from '@/components/dashboard/bncc/bncc-filters'
import { BnccSkillList } from '@/components/dashboard/bncc/bncc-skill-list'
import { BnccSkillDetailPanel } from '@/components/dashboard/bncc/bncc-skill-detail'
import { BnccPageSkeleton } from '@/components/dashboard/bncc/bncc-page-skeleton'
import { useBnccSkillDetail, useBnccSkills } from '@/hooks/bncc/use-bncc-skills'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Filters {
  q?: string
  educationLevel?: string
  grades?: string[]
  subject?: string
}

export default function DiretrizesPage() {
  const [filters, setFilters] = useState<Filters>({})
  const [detailId, setDetailId] = useState<string | undefined>(undefined)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const {
    items,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useBnccSkills(filters, 30)

  const {
    data: selectedSkill,
    isLoading: isDetailLoading,
  } = useBnccSkillDetail(detailId)

  const handleFiltersChange = useCallback((next: Filters) => {
    setFilters(next)
  }, [])

  const handleOpenDetails = useCallback((id: string) => {
    setDetailId(id)
    setIsDetailOpen(true)
  }, [])

  if (isLoading && items.length === 0) {
    return <BnccPageSkeleton />
  }

  return (
    <PageScaffold className="pt-4 sm:pt-6">
      <PageScaffold.Header title="Diretrizes" />

      <PageScaffold.Controls>
        <BnccFilters value={filters} onChange={handleFiltersChange} />
      </PageScaffold.Controls>

      <section className="px-0 min-h-[420px]">
        {error ? (
          <div className="rounded-4 border border-destructive/20 bg-destructive/5 p-6 text-center">
            <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
            <p className="mt-3 text-sm font-semibold text-destructive">
              {error.message || 'Erro ao carregar habilidades BNCC.'}
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-4 border border-dashed border-line bg-card p-10 text-center">
            <p className="text-sm text-ink-soft">Nenhuma habilidade encontrada para esses filtros.</p>
          </div>
        ) : (
          <BnccSkillList
            items={items}
            onOpenDetails={handleOpenDetails}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => fetchNextPage()}
          />
        )}
      </section>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Habilidade</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <BnccSkillDetailPanel
              skill={selectedSkill}
              isLoading={Boolean(detailId) && isDetailLoading}
            />
          </div>
        </DialogContent>
      </Dialog>
    </PageScaffold>
  )
}
