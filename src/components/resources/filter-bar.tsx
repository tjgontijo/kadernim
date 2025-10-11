'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'
import { EducationLevel, Subject } from './ResourcesClient'

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

export function FilterBar({
  subjects,
  educationLevels,
  selectedSubject,
  selectedLevel,
  searchQuery,
  onSubjectChange,
  onLevelChange,
  onSearchChange
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Select value={selectedLevel} onValueChange={onLevelChange}>
        <SelectTrigger className="w-full sm:w-[180px] cursor-pointer">
          <SelectValue placeholder="Nível de Ensino" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os níveis</SelectItem>
          {educationLevels
            .map(level => (
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
  )
}
