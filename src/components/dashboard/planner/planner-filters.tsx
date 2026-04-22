'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/dashboard/shared/search-input'
import { Filter } from 'lucide-react'
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
import { useEducationLevels, useGrades, useSubjects } from '@/hooks/taxonomy/use-taxonomy'

interface FilterOption {
  slug: string
  name: string
}

export interface PlannerFiltersValue {
  q?: string
  educationLevel?: string
  grade?: string
  subject?: string
}

interface PlannerFiltersProps {
  value: PlannerFiltersValue
  onChange: (value: PlannerFiltersValue) => void
}

export function PlannerFilters({ value, onChange }: PlannerFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState(value.q || '')
  const [level, setLevel] = useState(value.educationLevel || 'all')
  const [grade, setGrade] = useState(value.grade || 'all')
  const [subject, setSubject] = useState(value.subject || 'all')

  const { data: levels = [] } = useEducationLevels()
  const { data: grades = [] } = useGrades(level)
  const { data: subjects = [] } = useSubjects(level, grade)

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (level !== 'all') count += 1
    if (grade !== 'all') count += 1
    if (subject !== 'all') count += 1
    return count
  }, [level, grade, subject])

  const buildPayload = (): PlannerFiltersValue => ({
    q: query.trim() || undefined,
    educationLevel: level === 'all' ? undefined : level,
    grade: grade === 'all' ? undefined : grade,
    subject: subject === 'all' ? undefined : subject,
  })

  const handleApplyFilters = (close = false) => {
    onChange(buildPayload())
    if (close) setIsOpen(false)
  }

  const handleClearFilters = (close = false) => {
    setQuery('')
    setLevel('all')
    setGrade('all')
    setSubject('all')
    onChange({
      q: undefined,
      educationLevel: undefined,
      grade: undefined,
      subject: undefined,
    })
    if (close) setIsOpen(false)
  }

  return (
    <div className="w-full">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-2 w-full">
          <SearchInput
            placeholder="Buscar por título, recurso ou disciplina"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery('')}
            aria-label="Pesquisar planos de aula"
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
            <DialogTitle>Filtrar Planos</DialogTitle>
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
                  setGrade('all')
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
              <Select
                value={grade}
                onValueChange={(next) => {
                  setGrade(next)
                  setSubject('all')
                }}
                disabled={level === 'all'}
              >
                <SelectTrigger className="h-12 w-full rounded-2xl text-sm font-semibold [&>span]:truncate">
                  <SelectValue placeholder={level === 'all' ? 'Selecione etapa primeiro' : 'Selecione ano/faixa'} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/50">
                  <SelectItem value="all">Todos os Anos</SelectItem>
                  {grades.map((item: FilterOption) => (
                    <SelectItem key={item.slug} value={item.slug}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Componente / Campo
              </label>
              <Select
                value={subject}
                onValueChange={setSubject}
                disabled={level === 'all'}
              >
                <SelectTrigger className="h-12 w-full rounded-2xl text-sm font-semibold [&>span]:truncate">
                  <SelectValue placeholder={level === 'all' ? 'Selecione etapa primeiro' : 'Selecione componente'} />
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
