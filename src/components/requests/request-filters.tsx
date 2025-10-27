'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface EducationLevel {
  id: string
  name: string
}

interface Subject {
  id: string
  name: string
}

interface RequestFiltersProps {
  educationLevels: EducationLevel[]
  subjects: Subject[]
  onFiltersChange: (filters: {
    educationLevelId?: string
    subjectId?: string
    myRequests?: boolean
  }) => void
}

export function RequestFilters({
  educationLevels,
  subjects,
  onFiltersChange,
}: RequestFiltersProps) {
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [showMyRequests, setShowMyRequests] = useState(false)

  const handleLevelChange = (value: string) => {
    const newLevel = value === selectedLevel ? '' : value
    setSelectedLevel(newLevel)
    onFiltersChange({
      educationLevelId: newLevel || undefined,
      subjectId: selectedSubject || undefined,
      myRequests: showMyRequests,
    })
  }

  const handleSubjectChange = (value: string) => {
    const newSubject = value === selectedSubject ? '' : value
    setSelectedSubject(newSubject)
    onFiltersChange({
      educationLevelId: selectedLevel || undefined,
      subjectId: newSubject || undefined,
      myRequests: showMyRequests,
    })
  }

  const handleMyRequests = () => {
    const newShowMyRequests = !showMyRequests
    setShowMyRequests(newShowMyRequests)
    onFiltersChange({
      educationLevelId: selectedLevel || undefined,
      subjectId: selectedSubject || undefined,
      myRequests: newShowMyRequests,
    })
  }

  const hasActiveFilters = selectedLevel || selectedSubject || showMyRequests

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
      {/* Level Filter */}
      <Select value={selectedLevel} onValueChange={handleLevelChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Nível de Ensino" />
        </SelectTrigger>
        <SelectContent>
          {educationLevels.map((level) => (
            <SelectItem key={level.id} value={level.id}>
              {level.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Subject Filter */}
      <Select value={selectedSubject} onValueChange={handleSubjectChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Disciplina" />
        </SelectTrigger>
        <SelectContent>
          {subjects.map((subject) => (
            <SelectItem key={subject.id} value={subject.id}>
              {subject.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* My Requests Filter */}
      <Button
        variant={showMyRequests ? 'default' : 'outline'}
        onClick={handleMyRequests}
        className="w-full md:w-auto"
      >
        Meus Pedidos
      </Button>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedLevel('')
            setSelectedSubject('')
            setShowMyRequests(false)
            onFiltersChange({})
          }}
          className="w-full md:w-auto"
        >
          <X size={16} className="mr-1" />
          Limpar
        </Button>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedLevel && (
            <Badge variant="secondary" className="text-xs">
              {educationLevels.find((l) => l.id === selectedLevel)?.name}
            </Badge>
          )}
          {selectedSubject && (
            <Badge variant="secondary" className="text-xs">
              {subjects.find((s) => s.id === selectedSubject)?.name}
            </Badge>
          )}
          {showMyRequests && (
            <Badge variant="secondary" className="text-xs">
              Meus Pedidos
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
