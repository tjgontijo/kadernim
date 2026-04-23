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
  
  // Estado local para os inputs
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

  // Função para compor o payload de filtros
  const getPayload = (overrides: { q?: string; l?: string; g?: string; s?: string } = {}) => {
    const q = overrides.q !== undefined ? overrides.q : query;
    const l = overrides.l !== undefined ? overrides.l : level;
    const g = overrides.g !== undefined ? overrides.g : grade;
    const s = overrides.s !== undefined ? overrides.s : subject;

    return {
      q: q.trim() || undefined,
      educationLevel: l === 'all' ? undefined : l,
      grade: g === 'all' ? undefined : g,
      subject: s === 'all' ? undefined : s,
    };
  };

  // Debounce para a busca (Event Handler)
  const debouncedSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (val: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        onFiltersChange(getPayload({ q: val }));
      }, 500);
    };
  }, [onFiltersChange, level, grade, subject]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    debouncedSearch(val);
  };

  const handleLevelChange = (val: string) => {
    setLevel(val);
    setGrade('all');
    setSubject('all');
    onFiltersChange(getPayload({ l: val, g: 'all', s: 'all' }));
  };

  const handleGradeChange = (val: string) => {
    setGrade(val);
    setSubject('all');
    onFiltersChange(getPayload({ g: val, s: 'all' }));
  };

  const handleSubjectChange = (val: string) => {
    setSubject(val);
    onFiltersChange(getPayload({ s: val }));
  };

  const handleClear = () => {
    setLevel('all');
    setGrade('all');
    setSubject('all');
    setQuery('');
    onFiltersChange({
      q: undefined,
      educationLevel: undefined,
      grade: undefined,
      subject: undefined,
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center gap-2 w-full">
        <SearchInput
          placeholder="Buscar materiais..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onClear={() => handleQueryChange('')}
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
              Etapa de Ensino
            </label>
            <Select value={level} onValueChange={handleLevelChange}>
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
            <Select value={grade} onValueChange={handleGradeChange} disabled={level === 'all'}>
              <SelectTrigger className="h-14 w-full bg-muted/30 border-border/50 rounded-2xl text-sm font-bold">
                <SelectValue placeholder="Todos os Anos" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/50">
                <SelectItem value="all">Todos os Anos</SelectItem>
                {grades.map((g: FilterOption) => <SelectItem key={g.slug} value={g.slug}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Componente / Matéria
            </label>
            <Select value={subject} onValueChange={handleSubjectChange} disabled={level === 'all'}>
              <SelectTrigger className="h-14 w-full bg-muted/30 border-border/50 rounded-2xl text-sm font-bold">
                <SelectValue placeholder="Todos os Componentes" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/50">
                <SelectItem value="all">Todos os Componentes</SelectItem>
                {subjects.map((s: FilterOption) => <SelectItem key={s.slug} value={s.slug}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2 grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-11 rounded-2xl font-semibold" onClick={handleClear}>
              Limpar Tudo
            </Button>
            <Button className="h-11 rounded-2xl font-semibold" onClick={() => setIsOpen(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
