'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Filter, Search } from 'lucide-react'

type Subject = {
  id: string
  name: string
  resourceCount: number
}

type EducationLevel = {
  id: string
  name: string
  resourceCount: number
}

interface ResourceFiltersProps {
  subjects: Subject[]
  educationLevels: EducationLevel[]
  className?: string
}

export function ResourceFilters({ subjects, educationLevels, className }: ResourceFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [subjectId, setSubjectId] = useState(searchParams.get('subjectId') || 'all')
  const [educationLevelId, setEducationLevelId] = useState(searchParams.get('educationLevelId') || 'all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const updateURL = useCallback(() => {
    const params = new URLSearchParams()
    
    if (search) params.set('search', search)
    if (subjectId && subjectId !== 'all') params.set('subjectId', subjectId)
    if (educationLevelId && educationLevelId !== 'all') params.set('educationLevelId', educationLevelId)
    
    router.push(`/resources?${params.toString()}`)
  }, [search, subjectId, educationLevelId, router])

  // Debounce search updates
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL()
    }, 300)

    return () => clearTimeout(timer)
  }, [updateURL])

  const hasActiveFilters = subjectId !== 'all' || educationLevelId !== 'all'

  const containerClassName = className ?? 'w-full'

  return (
    <div className={containerClassName}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Buscar recursos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-12 h-12 text-base rounded-full border-gray-200 focus:border-blue-500 focus:ring-blue-500"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 rounded-full hover:bg-gray-100 ${
                  hasActiveFilters ? 'text-blue-600 bg-blue-50' : 'text-gray-400'
                }`}
              >
                <Filter className="h-4 w-4" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-blue-600 rounded-full" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="h-[480px] max-h-[80vh] p-6 flex flex-col gap-6 rounded-t-3xl"
            >
              <SheetHeader className="pb-2">
                <SheetTitle className="text-lg font-semibold">Filtros</SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground">
                  Filtre os recursos por disciplina e nível de ensino para encontrar o conteúdo desejado.
                </SheetDescription>
              </SheetHeader>
              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                    Disciplina
                  </Label>
                  <Select value={subjectId} onValueChange={setSubjectId}>
                    <SelectTrigger className="h-12 w-full rounded-xl border-gray-200 text-base">
                      <SelectValue>
                        {subjectId === 'all'
                          ? 'Todas as disciplinas'
                          : subjects.find(s => s.id === subjectId)?.name || 'Todas as disciplinas'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="all">Todas as disciplinas</SelectItem>
                      {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name} ({subject.resourceCount})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-3">
                  <Label htmlFor="educationLevel" className="text-sm font-medium text-gray-700">
                    Nível de Ensino
                  </Label>
                  <Select value={educationLevelId} onValueChange={setEducationLevelId}>
                    <SelectTrigger className="h-12 w-full rounded-xl border-gray-200 text-base">
                      <SelectValue>
                        {educationLevelId === 'all'
                          ? 'Todos os níveis'
                          : educationLevels.find(l => l.id === educationLevelId)?.name || 'Todos os níveis'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="all">Todos os níveis</SelectItem>
                      {educationLevels.map(level => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.name} ({level.resourceCount})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-3 pt-4 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSubjectId('all')
                    setEducationLevelId('all')
                  }}
                  className="h-12 w-full sm:w-auto sm:flex-1"
                >
                  Limpar Filtros
                </Button>
                <Button
                  onClick={() => setIsFilterOpen(false)}
                  className="h-12 w-full sm:w-auto sm:flex-1"
                >
                  Aplicar
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}