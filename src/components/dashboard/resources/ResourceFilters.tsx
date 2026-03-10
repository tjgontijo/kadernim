'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Filter } from 'lucide-react'
import type { ResourceTab } from './ResourceTabs'
import { SearchInput } from '../shared/search-input'

interface FilterOption {
  slug: string
  name: string
}

interface ResourceFiltersProps {
  onFiltersChange: (filters: { q?: string; educationLevel?: string; grade?: string; subject?: string }) => void
  tab?: ResourceTab
}

export function ResourceFilters({ onFiltersChange, tab = 'all' }: ResourceFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [level, setLevel] = useState<string>('all')
  const [grade, setGrade] = useState<string>('all')
  const [subject, setSubject] = useState<string>('all')
  const [query, setQuery] = useState<string>('')

  // Opções para os dropdowns
  const [levels, setLevels] = useState<FilterOption[]>([])
  const [grades, setGrades] = useState<FilterOption[]>([])
  const [subjects, setSubjects] = useState<FilterOption[]>([])

  // Carregar Etapas ao montar
  useEffect(() => {
    fetch('/api/v1/education-levels')
      .then(res => res.json())
      .then(data => { if (data.success) setLevels(data.data); });
  }, [])

  // Carregar Anos quando Etapa mudar
  useEffect(() => {
    if (level === 'all') {
      setGrades([]);
      setGrade('all');
      return;
    }
    fetch(`/api/v1/grades?educationLevelSlug=${level}`)
      .then(res => res.json())
      .then(data => { if (data.success) setGrades(data.data); });

    setGrade('all');
    setSubject('all');
  }, [level])

  // Carregar Disciplinas quando Etapa ou Ano mudar
  useEffect(() => {
    if (level === 'all') {
      setSubjects([]);
      setSubject('all');
      return;
    }

    const params = new URLSearchParams();
    if (level !== 'all') params.append('educationLevelSlug', level);
    if (grade !== 'all') params.append('gradeSlug', grade);

    fetch(`/api/v1/subjects?${params.toString()}`)
      .then(res => res.json())
      .then(data => { if (data.success) setSubjects(data.data); });

    setSubject('all');
  }, [grade, level])

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (level !== 'all') count++;
    if (grade !== 'all') count++;
    if (subject !== 'all') count++;
    return count;
  }, [level, grade, subject])

  const placeholder =
    tab === 'mine'
      ? 'Buscar nos seus recursos'
      : tab === 'free'
        ? 'Buscar recursos gratuitos'
        : 'Buscar materiais...'

  const handleApply = () => {
    onFiltersChange({
      q: query || undefined,
      educationLevel: level === 'all' ? undefined : level,
      grade: grade === 'all' ? undefined : grade,
      subject: subject === 'all' ? undefined : subject,
    })
    setIsOpen(false)
  }

  const handleClear = () => {
    setLevel('all')
    setGrade('all')
    setSubject('all')
    onFiltersChange({
      q: query || undefined,
      educationLevel: undefined,
      grade: undefined,
      subject: undefined,
    })
    setIsOpen(false)
  }

  // Debounce apenas da busca
  useEffect(() => {
    const id = setTimeout(() => {
      onFiltersChange({
        q: query || undefined,
        educationLevel: level === 'all' ? undefined : level,
        grade: grade === 'all' ? undefined : grade,
        subject: subject === 'all' ? undefined : subject,
      })
    }, 450)
    return () => clearTimeout(id)
  }, [query])

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center gap-2 w-full">
        <SearchInput
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery('')}
          aria-label="Pesquisar recursos"
        />

        <DrawerTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label="Abrir filtros"
            className="h-11 sm:h-12 w-11 sm:w-12 rounded-2xl border-border/50 shrink-0 relative"
          >
            <Filter className="h-4 w-4 text-foreground/70" />
            {activeFiltersCount > 0 && (
              <span
                className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-black text-primary-foreground shadow-lg shadow-primary/20 ring-2 ring-background"
                aria-label={`${activeFiltersCount} filtros ativos`}
              >
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </DrawerTrigger>
      </div>

      <DrawerContent className="rounded-t-[32px] p-6 max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="text-2xl font-black text-center">Filtrar Materiais</DrawerTitle>
          <DrawerDescription className="text-center font-medium">Ajuste os filtros para encontrar o material ideal.</DrawerDescription>
        </DrawerHeader>

        <div className="py-6 space-y-6 overflow-y-auto">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {level === 'educacao-infantil' ? 'Etapa' : 'Etapa de Ensino'}
              </label>
              <Select value={level} onValueChange={setLevel}>
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
              <Select value={grade} onValueChange={setGrade} disabled={level === 'all'}>
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
          </div>

          <div className="flex gap-3 pt-4 pb-2">
            <Button
              variant="outline"
              className="h-14 flex-1 rounded-2xl font-bold"
              onClick={handleClear}
            >
              Limpar
            </Button>
            <Button
              className="h-14 flex-1 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20"
              onClick={handleApply}
            >
              Ver Materiais
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
