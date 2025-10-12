'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResourceGrid } from './resource-grid'
import { FilterBar } from './filter-bar'
import { Spinner } from '@/components/ui/spinner'

// Tipos
export interface Resource {
  id: string
  title: string
  description: string
  imageUrl: string
  subjectId: string
  subjectName: string
  educationLevelId: string
  educationLevelName: string
  isFree: boolean
  hasAccess: boolean
  fileCount: number
}

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

export function ResourcesClient() {
  const [resources, setResources] = useState<Resource[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  // Buscar dados do banco de dados
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      
      try {
        // Buscar recursos
        const resourcesResponse = await fetch('/api/resources')
        if (!resourcesResponse.ok) {
          throw new Error('Erro ao buscar recursos')
        }
        const resourcesData = await resourcesResponse.json()
        
        // Buscar disciplinas
        const subjectsResponse = await fetch('/api/subjects/public')
        if (!subjectsResponse.ok) {
          throw new Error('Erro ao buscar disciplinas')
        }
        const subjectsData = await subjectsResponse.json()
        
        // Buscar níveis de ensino
        const levelsResponse = await fetch('/api/education-levels/public')
        if (!levelsResponse.ok) {
          throw new Error('Erro ao buscar níveis de ensino')
        }
        const levelsData = await levelsResponse.json()
        
        // Atualizar estado com os dados do banco
        setResources(resourcesData)
        setSubjects(subjectsData)
        setEducationLevels(levelsData)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Filtragem de recursos
  const filteredResources = resources.filter(resource => {
    // Filtro por abas (todos, gratuitos, premium)
    if (activeTab === 'free' && !resource.isFree) return false
    if (activeTab === 'premium' && resource.isFree) return false
    
    // Filtro por disciplina
    if (selectedSubject !== 'all' && resource.subjectId !== selectedSubject) return false
    
    // Filtro por nível educacional
    if (selectedLevel !== 'all' && resource.educationLevelId !== selectedLevel) return false
    
    // Filtro por busca
    if (searchQuery && !resource.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    
    return true
  })

  return (
    <div className="py-6"> 
      
      <Tabs defaultValue="all" className="mt-6" onValueChange={setActiveTab}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="all" className="cursor-pointer">Todos</TabsTrigger>
            <TabsTrigger value="free" className="cursor-pointer">Gratuitos</TabsTrigger>
            <TabsTrigger value="premium" className="cursor-pointer">Premium</TabsTrigger>
          </TabsList>
          
          <FilterBar 
            subjects={subjects}
            educationLevels={educationLevels}
            selectedSubject={selectedSubject}
            selectedLevel={selectedLevel}
            searchQuery={searchQuery}
            onSubjectChange={setSelectedSubject}
            onLevelChange={setSelectedLevel}
            onSearchChange={setSearchQuery}
          />
        </div>
        
        <TabsContent value="all" className="mt-6">
          {isLoading ? (
            <div className="flex h-60 items-center justify-center">
              <Spinner className="h-8 w-8 text-primary" />
            </div>
          ) : (
            <ResourceGrid resources={filteredResources} />
          )}
        </TabsContent>
        
        <TabsContent value="free" className="mt-6">
          {isLoading ? (
            <div className="flex h-60 items-center justify-center">
              <Spinner className="h-8 w-8 text-primary" />
            </div>
          ) : (
            <ResourceGrid resources={filteredResources} />
          )}
        </TabsContent>
        
        <TabsContent value="premium" className="mt-6">
          {isLoading ? (
            <div className="flex h-60 items-center justify-center">
              <Spinner className="h-8 w-8 text-primary" />
            </div>
          ) : (
            <ResourceGrid resources={filteredResources} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
