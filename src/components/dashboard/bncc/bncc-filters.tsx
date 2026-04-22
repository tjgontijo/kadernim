'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/dashboard/shared/search-input'
import { Filter, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useEducationLevels,
  useGrades,
  useSubjects,
} from '@/hooks/taxonomy/use-taxonomy'

interface BnccFiltersValue {
  q?: string
  educationLevel?: string
  grades?: string[]
  subject?: string
}

interface BnccFiltersProps {
  value: BnccFiltersValue
  onChange: (value: BnccFiltersValue) => void
}

interface FilterOption {
  slug: string
  name: string
}

export function BnccFilters({ value, onChange }: BnccFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState(value.q || '')
  const [level, setLevel] = useState(value.educationLevel || 'all')
  const [selectedGrades, setSelectedGrades] = useState<string[]>(value.grades || [])
  const [subject, setSubject] = useState(value.subject || 'all')

  const { data: levels = [] } = useEducationLevels()
  const { data: grades = [] } = useGrades(level)
  const singleGrade = selectedGrades.length === 1 ? selectedGrades[0] : undefined
  const { data: subjects = [] } = useSubjects(level, singleGrade)

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (level !== 'all') count += 1
    if (selectedGrades.length > 0) count += 1
    if (subject !== 'all') count += 1
    return count
  }, [level, selectedGrades, subject])

  const buildPayload = (): BnccFiltersValue => ({
    q: query.trim() || undefined,
    educationLevel: level === 'all' ? undefined : level,
    grades: selectedGrades.length > 0 ? selectedGrades : undefined,
    subject: subject === 'all' ? undefined : subject,
  })

  const handleApplyFilters = (closeDrawer = false) => {
    onChange({
      ...buildPayload(),
    })
    if (closeDrawer) {
      setIsOpen(false)
    }
  }

  const handleClearFilters = (closeDrawer = false) => {
    setQuery('')
    setLevel('all')
    setSelectedGrades([])
    setSubject('all')
    onChange({
      q: undefined,
      educationLevel: undefined,
      grades: undefined,
      subject: undefined,
    })
    if (closeDrawer) {
      setIsOpen(false)
    }
  }

  const toggleGrade = (slug: string) => {
    setSelectedGrades((prev) => (
      prev.includes(slug)
        ? prev.filter((item) => item !== slug)
        : [...prev, slug]
    ))
  }

  return (
    <div className="w-full">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-2 w-full">
          <SearchInput
            placeholder="Buscar por codigo, habilidade ou objeto de conhecimento"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery('')}
            aria-label="Pesquisar habilidades BNCC"
          />

          <DialogTrigger asChild>
          <Button
            variant="outline"
            aria-label="Abrir dialog de filtros"
            className="h-11 sm:h-12 rounded-2xl border-border/50 shrink-0 relative px-4 font-semibold"
          >
            <Filter className="h-4 w-4 text-foreground/70" />
            <span className="ml-2 hidden sm:inline">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-black text-primary-foreground shadow-lg shadow-primary/20 ring-2 ring-background">
                {activeFiltersCount}
              </span>
            )}
          </Button>
          </DialogTrigger>
        </div>

        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Filtrar Diretrizes</DialogTitle>
            <DialogDescription>
              Escolha etapa, ano/faixa e componente nesta ordem.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Etapa de Ensino
              </label>
              <Select
                value={level}
                onValueChange={(next) => {
                  setLevel(next)
                  setSelectedGrades([])
                  setSubject('all')
                }}
              >
                <SelectTrigger className="h-12 w-full rounded-2xl text-sm font-semibold [&>span]:truncate">
                  <SelectValue placeholder="Selecione a etapa" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/50">
                  <SelectItem value="all">Todas as Etapas</SelectItem>
                  {levels.map((item: FilterOption) => (
                    <SelectItem key={item.slug} value={item.slug}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Ano / Faixa
              </label>
              <div className="rounded-2xl border border-border/50 bg-muted/20 p-3 max-h-56 overflow-y-auto">
                {level === 'all' ? (
                  <p className="text-sm text-ink-mute">Selecione a etapa primeiro.</p>
                ) : grades.length === 0 ? (
                  <p className="text-sm text-ink-mute">Nenhum ano/faixa disponível para esta etapa.</p>
                ) : (
                  <div className="flex items-start gap-2">
                    <div className="flex flex-wrap gap-2 flex-1">
                      {grades.map((item: FilterOption) => {
                        const selected = selectedGrades.includes(item.slug)
                        return (
                          <button
                            key={item.slug}
                            type="button"
                            onClick={() => {
                              toggleGrade(item.slug)
                              setSubject('all')
                            }}
                            className={
                              `rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ` +
                              (selected
                                ? 'border-terracotta/40 bg-terracotta-2/50 text-terracotta'
                                : 'border-line bg-paper text-ink-soft hover:bg-paper-2')
                            }
                            aria-pressed={selected}
                          >
                            {item.name}
                          </button>
                        )
                      })}
                    </div>
                    {selectedGrades.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-ink-mute hover:text-ink shrink-0"
                        onClick={() => {
                          setSelectedGrades([])
                          setSubject('all')
                        }}
                        aria-label="Limpar anos/faixas"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Componente / Campo
              </label>
              <Select
                value={subject}
                onValueChange={setSubject}
                disabled={level === 'all' || selectedGrades.length === 0}
              >
                <SelectTrigger className="h-12 w-full rounded-2xl text-sm font-semibold [&>span]:truncate">
                  <SelectValue placeholder={selectedGrades.length === 0 ? 'Selecione ano/faixa primeiro' : 'Selecione componente'} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/50">
                  <SelectItem value="all">Todos os Componentes</SelectItem>
                  {subjects.map((item: FilterOption) => (
                    <SelectItem key={item.slug} value={item.slug}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-11 rounded-2xl font-semibold"
                onClick={() => handleClearFilters(true)}
              >
                Limpar
              </Button>
              <Button
                className="h-11 rounded-2xl font-semibold"
                onClick={() => handleApplyFilters(true)}
              >
                Aplicar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
