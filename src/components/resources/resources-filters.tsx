// src/components/resources/resources-filters.tsx
'use client'

import { useState, useCallback, useEffect } from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Subject {
  id: string
  name: string
  slug: string
}

interface EducationLevel {
  id: string
  name: string
  slug: string
}

interface ResourcesFiltersProps {
  subjects: Subject[]
  educationLevels: EducationLevel[]
  onFilterChange: (filters: {
    subjectId: string
    educationLevelId: string
  }) => void
}

export function ResourcesFilters({
  subjects,
  educationLevels,
  onFilterChange
}: ResourcesFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempSubjectId, setTempSubjectId] = useState('all')
  const [tempEducationLevelId, setTempEducationLevelId] = useState('all')
  const [subjectId, setSubjectId] = useState('all')
  const [educationLevelId, setEducationLevelId] = useState('all')

  // Notificar mudanças
  useEffect(() => {
    onFilterChange({
      subjectId,
      educationLevelId
    })
  }, [subjectId, educationLevelId, onFilterChange])

  const activeFilters = [
    subjectId !== 'all' ? subjects.find(s => s.id === subjectId)?.name : null,
    educationLevelId !== 'all' ? educationLevels.find(l => l.id === educationLevelId)?.name : null
  ].filter(Boolean)

  const clearFilters = useCallback(() => {
    setSubjectId('all')
    setEducationLevelId('all')
    setTempSubjectId('all')
    setTempEducationLevelId('all')
  }, [])

  const applyFilters = useCallback(() => {
    setSubjectId(tempSubjectId)
    setEducationLevelId(tempEducationLevelId)
    setIsOpen(false)
  }, [tempSubjectId, tempEducationLevelId])

  const openSheet = useCallback(() => {
    setTempSubjectId(subjectId)
    setTempEducationLevelId(educationLevelId)
    setIsOpen(true)
  }, [subjectId, educationLevelId])

  return (
    <>
      {/* Título + Botão Filtro */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Meus Recursos</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={openSheet}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      {/* Chips de filtros ativos */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="gap-1 px-3 py-1">
              {filter}
              <button
                onClick={() => {
                  if (index === 0 && subjectId !== 'all') setSubjectId('all')
                  if (index === 1 && educationLevelId !== 'all') setEducationLevelId('all')
                  if (index === 0 && educationLevelId !== 'all' && subjectId === 'all') setEducationLevelId('all')
                }}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 px-2 text-xs"
          >
            Limpar tudo
          </Button>
        </div>
      )}

      {/* Bottom Sheet de Filtros */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-auto px-6">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
            <SheetDescription>
              Selecione os filtros para refinar sua busca de recursos
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 py-4 px-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nível de Ensino</label>
              <Select value={tempEducationLevelId} onValueChange={setTempEducationLevelId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os níveis</SelectItem>
                  {educationLevels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Disciplina</label>
              <Select value={tempSubjectId} onValueChange={setTempSubjectId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a disciplina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as disciplinas</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter className="flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setTempSubjectId('all')
                setTempEducationLevelId('all')
              }}
              className="flex-1"
            >
              Limpar
            </Button>
            <Button onClick={applyFilters} className="flex-1">
              Aplicar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
