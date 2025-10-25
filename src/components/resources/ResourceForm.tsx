'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { QuillEditor } from '@/components/editor/QuillEditor'

// Tipo Resource baseado no modelo Prisma
type Resource = {
  id?: string
  title: string
  description: string
  imageUrl: string
  isFree: boolean
  isActive: boolean
  subjectId: string
  educationLevelId: string
}

// Tipos para opções de select
type Subject = {
  id: string
  name: string
}

type EducationLevel = {
  id: string
  name: string
}

export function ResourceForm({ resource }: { resource?: Resource }) {
  const router = useRouter()
  const [formData, setFormData] = useState<Resource>({
    title: resource?.title || '',
    description: resource?.description || '',
    imageUrl: resource?.imageUrl || '',
    isFree: resource?.isFree || false,
    isActive: resource?.isActive !== undefined ? resource.isActive : true,
    subjectId: resource?.subjectId || '',
    educationLevelId: resource?.educationLevelId || ''
  })
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar opções de disciplinas e níveis de ensino
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [subjectsRes, levelsRes] = await Promise.all([
          fetch('/api/v1/subjects'),
          fetch('/api/v1/education-levels')
        ])

        if (!subjectsRes.ok || !levelsRes.ok) {
          throw new Error('Erro ao carregar opções')
        }

        const [subjectsData, levelsData] = await Promise.all([
          subjectsRes.json(),
          levelsRes.json()
        ])

        setSubjects(subjectsData)
        setEducationLevels(levelsData)
      } catch (err) {
        setError('Erro ao carregar opções. Tente novamente.')
        console.error(err)
      }
    }

    fetchOptions()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const url = resource?.id
        ? `/api/admin/resources/${resource.id}`
        : '/api/admin/resources'
      const method = resource?.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error(resource?.id ? 'Erro ao atualizar recurso' : 'Erro ao criar recurso')
      }

      router.push('/admin/resources')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/resources')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{resource?.id ? 'Editar Recurso' : 'Novo Recurso'}</h1>
      
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="isActive" 
              checked={formData.isActive} 
              onCheckedChange={(checked) => handleSwitchChange('isActive', checked === true)} 
            />
            <Label htmlFor="isActive" className="text-gray-900 dark:text-white">Ativo</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="isFree" 
              checked={formData.isFree} 
              onCheckedChange={(checked) => handleSwitchChange('isFree', checked === true)} 
            />
            <Label htmlFor="isFree" className="text-gray-900 dark:text-white">Gratuito</Label>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="title" className="text-gray-900 dark:text-white mb-2 block">Nome do Recurso</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Digite o nome do recurso"
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
          />
        </div>

        <div>
          <Label htmlFor="imageUrl" className="text-gray-900 dark:text-white mb-2 block">URL da Imagem de Capa</Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://exemplo.com/imagem.jpg"
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="description" className="text-gray-900 dark:text-white block">Descrição do Recurso</Label>
          <QuillEditor value={formData.description} onChange={handleDescriptionChange} />
        </div>

        <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-2">
          <div>
            <Label htmlFor="subjectId" className="text-gray-900 dark:text-white mb-2 block">Disciplina</Label>
            <Select value={formData.subjectId} onValueChange={(value) => handleSelectChange('subjectId', value)}>
              <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Selecione uma disciplina" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="educationLevelId" className="text-gray-900 dark:text-white mb-2 block">Nível de Ensino</Label>
            <Select value={formData.educationLevelId} onValueChange={(value) => handleSelectChange('educationLevelId', value)}>
              <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Selecione um nível de ensino" />
              </SelectTrigger>
              <SelectContent>
                {educationLevels.map(level => (
                  <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={handleCancel} className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-900 dark:hover:bg-blue-800 text-white">
          {isLoading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}
