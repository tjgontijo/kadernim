'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Filter, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface EducationLevel {
  id: string
  name: string
}

interface Subject {
  id: string
  name: string
}

interface RequestFiltersSheetProps {
  educationLevels: EducationLevel[]
  subjects: Subject[]
  onFiltersChange: (filters: {
    educationLevelId?: string
    subjectId?: string
    myRequests?: boolean
  }) => void
}

export function RequestFiltersSheet({
  educationLevels,
  subjects,
  onFiltersChange,
}: RequestFiltersSheetProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [showMyRequests, setShowMyRequests] = useState(false)

  const hasActiveFilters = selectedLevel || selectedSubject || showMyRequests

  const handleApplyFilters = useCallback(() => {
    onFiltersChange({
      educationLevelId: selectedLevel || undefined,
      subjectId: selectedSubject || undefined,
      myRequests: showMyRequests,
    })
    setIsFilterOpen(false)
  }, [selectedLevel, selectedSubject, showMyRequests, onFiltersChange])

  const handleClearFilters = useCallback(() => {
    setSelectedLevel('')
    setSelectedSubject('')
    setShowMyRequests(false)
    onFiltersChange({})
  }, [onFiltersChange])

  const getActiveFilterCount = () => {
    let count = 0
    if (selectedLevel) count++
    if (selectedSubject) count++
    if (showMyRequests) count++
    return count
  }

  return (
    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-auto px-0 py-2 rounded-none gap-1 border-0 ${
            hasActiveFilters ? 'text-blue-600' : 'text-gray-600'
          } hover:bg-transparent`}
        >
          <Filter className="h-4 w-4" />
          {hasActiveFilters && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs font-semibold">
              {getActiveFilterCount()}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="h-auto max-h-[85vh] p-6 flex flex-col gap-6 rounded-t-3xl"
      >
        <SheetHeader className="pb-2">
          <SheetTitle className="text-lg font-semibold">Filtros</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Filtre as solicitações por nível de ensino, disciplina ou visualize apenas seus pedidos.
          </SheetDescription>
        </SheetHeader>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Nível de Ensino */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="level" className="text-sm font-medium text-gray-700">
              Nível de Ensino
            </Label>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="h-12 w-full rounded-xl border-gray-200 text-base">
                <SelectValue placeholder="Selecione um nível" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {educationLevels.map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Disciplina */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
              Disciplina
            </Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="h-12 w-full rounded-xl border-gray-200 text-base">
                <SelectValue placeholder="Selecione uma disciplina" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Meus Pedidos */}
        <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => setShowMyRequests(!showMyRequests)}
        >
          <input
            type="checkbox"
            id="myRequests"
            checked={showMyRequests}
            onChange={(e) => setShowMyRequests(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <Label htmlFor="myRequests" className="text-sm font-medium text-gray-700 cursor-pointer flex-1 m-0">
            Mostrar apenas meus pedidos
          </Label>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg">
            {selectedLevel && (
              <Badge variant="secondary" className="gap-1">
                {educationLevels.find((l) => l.id === selectedLevel)?.name}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedLevel('')} />
              </Badge>
            )}
            {selectedSubject && (
              <Badge variant="secondary" className="gap-1">
                {subjects.find((s) => s.id === selectedSubject)?.name}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedSubject('')} />
              </Badge>
            )}
            {showMyRequests && (
              <Badge variant="secondary" className="gap-1">
                Meus Pedidos
                <X className="h-3 w-3 cursor-pointer" onClick={() => setShowMyRequests(false)} />
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-auto flex flex-col gap-3 pt-4 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="h-12 w-full sm:w-auto sm:flex-1"
          >
            Limpar Filtros
          </Button>
          <Button
            onClick={handleApplyFilters}
            className="h-12 w-full sm:w-auto sm:flex-1"
          >
            Aplicar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
