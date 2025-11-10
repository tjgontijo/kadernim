'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Filter, Search, X } from 'lucide-react'
import { EducationLevelLabels } from '@/constants/educationLevel'
import { SubjectLabels } from '@/constants/subject'
import type { ResourceTab } from './ResourceTabs'

interface ResourceFiltersProps {
  onFiltersChange: (filters: { q?: string; educationLevel?: string; subject?: string }) => void
  tab?: ResourceTab
}

const educationLevels = Object.entries(EducationLevelLabels).map(([value, label]) => ({
  value,
  label,
}))

const subjects = Object.entries(SubjectLabels).map(([value, label]) => ({
  value,
  label,
}))

export function ResourceFilters({ onFiltersChange, tab = 'all' }: ResourceFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [educationLevel, setEducationLevel] = useState<string>('')
  const [subject, setSubject] = useState<string>('')
  const [query, setQuery] = useState<string>('')

  const activeFiltersCount = useMemo(
    () => [educationLevel, subject].filter(Boolean).length,
    [educationLevel, subject]
  )

  const placeholder =
    tab === 'mine'
      ? 'Buscar nos seus recursos'
      : tab === 'free'
      ? 'Buscar recursos gratuitos'
      : 'Buscar por título'

  const handleApply = () => {
    const filters = {
      q: query || undefined,
      educationLevel: educationLevel || undefined,
      subject: subject || undefined,
    }
    onFiltersChange(filters)
    setIsOpen(false)
  }

  const handleClear = () => {
    // Garante que o callback receba filtros limpos imediatamente
    const clearedFilters = {
      q: query || undefined,
      educationLevel: undefined,
      subject: undefined,
    }
    onFiltersChange(clearedFilters)

    // Agora limpa o estado local e fecha o painel
    setEducationLevel('')
    setSubject('')
    setIsOpen(false)
  }

  // Debounce apenas da busca
  useEffect(() => {
    const id = setTimeout(() => {
      onFiltersChange({ q: query || undefined })
    }, 450)
    return () => clearTimeout(id)
  }, [query, onFiltersChange])

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <div className="relative w-full">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            aria-label="Pesquisar recursos"
            className="pl-9 pr-12 h-10 text-sm"
          />
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Abrir filtros"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md"
            >
              <div className="relative">
                <Filter className="h-4 w-4 text-foreground" />
                {activeFiltersCount > 0 && (
                  <span
                    className="
                      absolute -right-1 -top-1 grid h-4 w-4 place-items-center
                      rounded-full bg-primary text-[10px] font-semibold text-primary-foreground
                    "
                    aria-label={`${activeFiltersCount} filtros ativos`}
                  >
                    {activeFiltersCount}
                  </span>
                )}
              </div>
            </Button>
          </SheetTrigger>
        </div>
      </div>

      <SheetContent side="bottom" className="max-h-[70vh] rounded-t-3xl px-6">
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b py-4">
            <SheetTitle className="text-lg">Filtrar recursos</SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              Ajuste sua busca por nível de ensino, disciplina ou palavras-chave.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-6 overflow-y-auto py-6">
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Nível de ensino
              </label>
              <Select value={educationLevel} onValueChange={setEducationLevel}>
                <SelectTrigger className="h-10 w-full text-sm">
                  <SelectValue placeholder="Selecione um nível" />
                </SelectTrigger>
                <SelectContent>
                  {educationLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Disciplina
              </label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="h-10 w-full text-sm">
                  <SelectValue placeholder="Selecione uma disciplina" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subj) => (
                    <SelectItem key={subj.value} value={subj.value}>
                      {subj.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {activeFiltersCount > 0 && (
              <div className="space-y-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-semibold text-blue-900">Filtros ativos</p>
                <div className="flex flex-wrap gap-2">
                  {educationLevel && (
                    <Badge
                      variant="secondary"
                      className="cursor-pointer gap-1 text-xs hover:bg-blue-200"
                      onClick={() => setEducationLevel('')}
                    >
                      {educationLevels.find((l) => l.value === educationLevel)?.label}
                      <X className="h-3 w-3" />
                    </Badge>
                  )}
                  {subject && (
                    <Badge
                      variant="secondary"
                      className="cursor-pointer gap-1 text-xs hover:bg-blue-200"
                      onClick={() => setSubject('')}
                    >
                      {subjects.find((s) => s.value === subject)?.label}
                      <X className="h-3 w-3" />
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 border-t pb-8 pt-6">
            <Button
              variant="outline"
              className="h-10 flex-1 text-sm"
              onClick={handleClear}
              disabled={activeFiltersCount === 0}
            >
              Limpar
            </Button>
            <Button className="h-10 flex-1 text-sm" onClick={handleApply}>
              Aplicar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
