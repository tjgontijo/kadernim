// src/components/resources/filter-bar.tsx
'use client'

import { memo, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Subject {
  id: string
  name: string
  slug: string
}

export interface EducationLevel {
  id: string
  name: string
  slug: string
}

interface FilterBarProps {
  subjects: Subject[]
  educationLevels: EducationLevel[]
  selectedSubject: string
  selectedLevel: string
  searchQuery: string
  onSubjectChange: (value: string) => void
  onLevelChange: (value: string) => void
  onSearchChange: (value: string) => void
}

function FilterBarComponent({
  subjects,
  educationLevels,
  selectedSubject,
  selectedLevel,
  searchQuery,
  onSubjectChange,
  onLevelChange,
  onSearchChange
}: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const hasActiveFilters = useMemo(
    () => selectedSubject !== 'all' || selectedLevel !== 'all' || searchQuery.trim() !== '',
    [selectedSubject, selectedLevel, searchQuery]
  )

  const clearFilters = () => {
    onSubjectChange('all')
    onLevelChange('all')
    onSearchChange('')
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end gap-2">
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Limpar filtros
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(prev => !prev)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {[selectedSubject !== 'all', selectedLevel !== 'all', searchQuery.trim() !== ''].filter(Boolean).length}
            </span>
          )}
        </Button>
      </div>

      <div
        className={cn(
          'grid gap-3 overflow-hidden transition-all duration-200',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select value={selectedLevel} onValueChange={onLevelChange}>
              <SelectTrigger className="w-full sm:w-[180px] cursor-pointer">
                <SelectValue placeholder="Nível de Ensino" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os níveis</SelectItem>
                {educationLevels.map(level => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSubject} onValueChange={onSubjectChange}>
              <SelectTrigger className="w-full sm:w-[180px] cursor-pointer">
                <SelectValue placeholder="Disciplina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as disciplinas</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative w-full sm:w-[220px]">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                placeholder="Buscar recursos..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 cursor-text"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const FilterBar = memo(FilterBarComponent)
