'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Filter, Trash2 } from 'lucide-react'
import { SearchInput } from '../shared/search-input'
import {
  useEducationLevels,
  useGrades,
  useSubjects,
} from '@/hooks/taxonomy/use-taxonomy'

interface FilterOption {
  slug: string
  name: string
}

interface ResourceFiltersProps {
  onFiltersChange: (filters: { q?: string; educationLevel?: string; grade?: string; subject?: string }) => void
}

export function ResourceFilters({ onFiltersChange }: ResourceFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [level, setLevel] = useState<string>('all')
  const [grade, setGrade] = useState<string>('all')
  const [subject, setSubject] = useState<string>('all')
  const [query, setQuery] = useState<string>('')

  const { data: levels = [] } = useEducationLevels()
  const { data: grades = [] } = useGrades(level)
  const { data: subjects = [] } = useSubjects(level, grade)

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (level !== 'all') count++;
    if (grade !== 'all') count++;
    if (subject !== 'all') count++;
    return count;
  }, [level, grade, subject])

  const placeholder = 'Buscar materiais...'

  const buildPayload = () => ({
    q: query.trim() || undefined,
    educationLevel: level === 'all' ? undefined : level,
    grade: grade === 'all' ? undefined : grade,
    subject: subject === 'all' ? undefined : subject,
  })

  const handleApply = (close = false) => {
    onFiltersChange({
      ...buildPayload(),
    })
    if (close) setIsOpen(false)
  }

  const handleClear = (close = false) => {
    setLevel('all')
    setGrade('all')
    setSubject('all')
    setQuery('')
    onFiltersChange({
      q: undefined,
      educationLevel: undefined,
      grade: undefined,
      subject: undefined,
    })
    if (close) setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center gap-2 w-full">
        <SearchInput
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery('')}
          aria-label="Pesquisar recursos"
        />

        <DialogTrigger asChild>
          <Button
            variant="outline"
            aria-label="Abrir filtros"
            className="h-11 sm:h-12 rounded-2xl border-border/50 shrink-0 relative px-4 font-semibold"
          >
            <Filter className="h-4 w-4 text-foreground/70" />
            <span className="ml-2 hidden sm:inline">Filtros</span>
            {activeFiltersCount > 0 && (
              <span
                className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-black text-primary-foreground shadow-lg shadow-primary/20 ring-2 ring-background"
                aria-label={`${activeFiltersCount} filtros ativos`}
              >
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Filtrar Materiais</DialogTitle>
          <DialogDescription>
            Escolha etapa, ano/faixa e componente nesta ordem.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {level === 'educacao-infantil' ? 'Etapa' : 'Etapa de Ensino'}
              </label>
              <Select value={level} onValueChange={(value) => {
                setLevel(value)
                setGrade('all')
                setSubject('all')
              }}>
                <SelectTrigger className="h-14 w-full bg-muted/30 border-border/50 rounded-2xl text-sm font-bold">
                  <SelectValue placeholder="Todas as Etapas" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/50">
                  <SelectItem value="all">Todas as Etapas</SelectItem>
                  {levels.map((l: FilterOption) => <SelectItem key={l.slug} value={l.slug}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {level === 'educacao-infantil' ? 'Faixa Etária' : 'Ano / Série'}
              </label>
              <Select value={grade} onValueChange={(value) => {
                setGrade(value)
                setSubject('all')
              }} disabled={level === 'all'}>
                <SelectTrigger className="h-14 w-full bg-muted/30 border-border/50 rounded-2xl text-sm font-bold">
                  <SelectValue placeholder={level === 'educacao-infantil' ? 'Faixa Etária' : 'Ano/Série'} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/50">
                  <SelectItem value="all">Todos os Anos</SelectItem>
                  {grades.map((g: FilterOption) => <SelectItem key={g.slug} value={g.slug}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {level === 'educacao-infantil' ? 'Campo de Experiência' : 'Componente / Matéria'}
              </label>
              <Select value={subject} onValueChange={setSubject} disabled={level === 'all'}>
                <SelectTrigger className="h-14 w-full bg-muted/30 border-border/50 rounded-2xl text-sm font-bold">
                  <SelectValue placeholder={level === 'educacao-infantil' ? 'Campo de Exp.' : 'Componente'} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/50">
                  <SelectItem value="all">Todos os Componentes</SelectItem>
                  {subjects.map((s: FilterOption) => <SelectItem key={s.slug} value={s.slug}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

          <div className="pt-2 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-11 rounded-2xl font-semibold"
              onClick={() => handleClear(true)}
            >
              Limpar
            </Button>
            <Button
              className="h-11 rounded-2xl font-semibold"
              onClick={() => handleApply(true)}
            >
              Aplicar
            </Button>
          </div>

          <div className="pt-1">
            <Button
              type="button"
              variant="ghost"
              className="w-full h-10 rounded-2xl text-ink-mute"
              onClick={() => {
                setGrade('all')
                setSubject('all')
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Limpar ano e componente
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
