'use client'

import * as React from 'react'
import { AlertTriangle, BookMarked, Eye, Loader2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useBnccSkillDetail, useBnccSkills } from '@/hooks/bncc/use-bncc-skills'
import { BnccSkillDetailPanel } from '@/components/dashboard/bncc/bncc-skill-detail'

interface BnccSelectorProps {
  value: string[]
  onChange: (value: string[]) => void
  educationLevel?: string
  grades?: string[]
  subject?: string
  disabled?: boolean
}

export function BnccSelector({
  value = [],
  onChange,
  educationLevel,
  grades,
  subject,
  disabled,
}: BnccSelectorProps) {
  const [search, setSearch] = React.useState('')
  const [detailId, setDetailId] = React.useState<string | undefined>(undefined)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)
  const debouncedSearch = useDebounce(search, 300)

  const normalizedGrades = React.useMemo(
    () => (grades?.filter(Boolean) ?? []),
    [grades]
  )
  const hasRequiredFilters = Boolean(
    educationLevel && subject && normalizedGrades.length > 0
  )
  const canLoadSkills = hasRequiredFilters && !disabled

  const {
    items,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useBnccSkills(
    {
      q: debouncedSearch || undefined,
      educationLevel,
      grades: normalizedGrades.length > 0 ? normalizedGrades : undefined,
      subject,
    },
    24,
    canLoadSkills
  )

  const {
    data: detailSkill,
    isLoading: isDetailLoading,
  } = useBnccSkillDetail(detailId)

  const toggleSkill = (code: string) => {
    if (value.includes(code)) {
      onChange(value.filter((v) => v !== code))
    } else {
      onChange([...value, code])
    }
  }

  const handleOpenDetails = (id: string) => {
    setDetailId(id)
    setIsDetailOpen(true)
  }

  return (
    <div className={cn(
      "space-y-4 border border-line rounded-4 bg-white overflow-hidden transition-all duration-300 shadow-sm",
      disabled && "opacity-50 grayscale pointer-events-none"
    )}>
      {/* Header com Busca */}
      <div className="p-4 bg-paper-2 border-b border-line flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mute/40" />
           <Input 
             placeholder={
               hasRequiredFilters
                 ? "Filtrar habilidades por termo ou código..."
                 : "Preencha etapa, ano e disciplina para listar habilidades"
             }
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             disabled={!hasRequiredFilters}
             className="pl-10 h-11 bg-white border-line-soft focus:ring-terracotta rounded-3 text-sm"
           />
        </div>
        <div className="flex shrink-0 gap-2 items-center text-[11px] font-bold text-ink-soft bg-white px-4 h-11 rounded-3 border border-line-soft">
           <BookMarked className="h-4 w-4 text-terracotta" />
           {value.length} SELECIONADAS
        </div>
      </div>

      {/* Lista de Habilidades */}
      <div className="max-h-[440px] overflow-y-auto px-2 py-2 space-y-2">
        {!hasRequiredFilters ? (
          <div className="rounded-3 border border-dashed border-line bg-card p-10 text-center">
            <p className="text-sm text-ink-soft">
              Preencha <b>etapa</b>, <b>ano</b> e <b>disciplina</b> para carregar as habilidades BNCC.
            </p>
          </div>
        ) : isLoading && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-ink-mute">
            <Loader2 className="h-8 w-8 animate-spin text-terracotta/40" />
            <span className="text-xs font-medium italic">Sincronizando com a base BNCC...</span>
          </div>
        ) : error ? (
          <div className="rounded-3 border border-destructive/20 bg-destructive/5 p-4 text-center">
            <AlertTriangle className="mx-auto h-5 w-5 text-destructive" />
            <p className="mt-2 text-xs font-semibold text-destructive">
              {error.message || 'Falha ao carregar habilidades BNCC.'}
            </p>
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {items.map((skill) => {
                const isSelected = value.includes(skill.code)
                return (
                  <article
                    key={skill.id}
                    className={cn(
                      "group relative rounded-4 border bg-card p-4 pl-14 pr-12 text-left shadow-sm",
                      isSelected ? "border-terracotta/25 bg-terracotta-2/20" : "border-line"
                    )}
                  >
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-md border border-line bg-white">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSkill(skill.code)}
                        className={cn(
                          "h-5 w-5 rounded-md border-line transition-all",
                          isSelected && "bg-terracotta border-terracotta"
                        )}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenDetails(skill.id)}
                      className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-xl text-ink-mute transition-colors hover:text-terracotta"
                      title="Ver detalhes da habilidade"
                      aria-label={`Ver detalhes da habilidade ${skill.code}`}
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-[0.06em] text-terracotta min-w-0">
                          <BookMarked className="h-4 w-4 shrink-0" />
                          <span className="truncate">{skill.code}</span>
                        </span>
                        <span className="text-[11px] text-ink-mute shrink-0">
                          {skill.relatedResourcesCount} materiais
                        </span>
                      </div>

                      <p className="text-sm leading-relaxed text-ink line-clamp-3 min-h-[66px]">
                        {skill.description}
                      </p>

                      <div className="flex flex-wrap gap-2 text-[11px] text-ink-soft">
                        <span className="rounded-full border border-line bg-paper px-2.5 py-1">
                          {skill.educationLevel.name}
                        </span>
                        {skill.grade && (
                          <span className="rounded-full border border-line bg-paper px-2.5 py-1">
                            {skill.grade.name}
                          </span>
                        )}
                        {skill.subject && (
                          <span className="rounded-full border border-line bg-paper px-2.5 py-1">
                            {skill.subject.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            {hasNextPage && (
              <div className="pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Carregar mais habilidades
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-3 border border-dashed border-line bg-card p-10 text-center">
            <p className="text-sm text-ink-soft">
              Nenhuma habilidade encontrada para os filtros atuais.
            </p>
          </div>
        )}
      </div>

      {/* Footer Informativo */}
      <div className="p-4 bg-paper-2 border-t border-line text-[11px] text-ink-mute italic flex justify-between items-center">
         <div className="flex items-center gap-2">
           {hasRequiredFilters ? (
             <span>
               Mostrando habilidades de <b>{subject}</b> para <b>{normalizedGrades.join(', ')}</b>
             </span>
           ) : (
             <span>Preencha etapa, ano e disciplina para habilitar a listagem BNCC.</span>
           )}
         </div>
         {hasRequiredFilters && value.length > 0 && (
           <button
             type="button"
             onClick={() => onChange([])}
             className="text-berry hover:underline font-bold not-italic"
           >
             Limpar Seleção
           </button>
         )}
      </div>

      <Dialog
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open)
          if (!open) setDetailId(undefined)
        }}
      >
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Habilidade</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <BnccSkillDetailPanel
              skill={detailSkill}
              isLoading={Boolean(detailId) && isDetailLoading}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
