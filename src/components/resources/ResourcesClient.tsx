'use client'

import { useState, useEffect } from 'react'
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
  hasActivePlan?: boolean
  hasIndividualAccess?: boolean
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
    // Filtro por disciplina
    if (selectedSubject !== 'all' && resource.subjectId !== selectedSubject) return false
    
    // Filtro por nível educacional
    if (selectedLevel !== 'all' && resource.educationLevelId !== selectedLevel) return false
    
    // Filtro por busca
    if (searchQuery && !resource.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    
    return true
  })

  // Verificar se o usuário tem plano premium
  const hasPremiumPlan = filteredResources.some(resource => resource.hasActivePlan)

  // Separar recursos em "Meus Materiais" e "Biblioteca"
  const myMaterials = filteredResources.filter(resource => 
    // Para usuários premium, mostrar todos os recursos que eles têm acesso
    // Para usuários sem premium, mostrar apenas os comprados individualmente
    hasPremiumPlan ? resource.hasAccess : resource.hasIndividualAccess === true
  )
  
  const otherMaterials = filteredResources.filter(resource => 
    // Para usuários premium, não mostrar nada aqui (tudo já está em "Meus Materiais")
    // Para usuários sem premium, mostrar recursos que não foram comprados individualmente
    hasPremiumPlan ? false : resource.hasIndividualAccess !== true
  )

  return (
    <div className="py-6">
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
      
      <div className="mt-6">
        {isLoading ? (
          <div className="flex h-60 items-center justify-center">
            <Spinner className="h-8 w-8 text-primary" />
          </div>
        ) : (
          <div className="space-y-12">
            {/* Seção de Meus Materiais */}
            {myMaterials.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6">Meus Recursos</h2>
                <ResourceGrid resources={myMaterials} />
              </section>
            )}
            
            {/* Seção de Biblioteca - só mostrar se não for premium ou se tiver conteúdo */}
            {(!hasPremiumPlan && otherMaterials.length > 0) && (
              <section>
                <h2 className="text-2xl font-bold mb-6">Biblioteca Completa</h2>
                <ResourceGrid resources={otherMaterials} />
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
