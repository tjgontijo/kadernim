'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { ResourceRequestWithRelations } from '@/types/request'
import { createResourceRequest, updateResourceRequest } from '@/app/(dashboard)/requests/actions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { createResourceRequestSchema, updateResourceRequestSchema } from '@/lib/requests/validations'
import { z } from 'zod'

interface EducationLevel {
  id: string
  name: string
}

interface Subject {
  id: string
  name: string
}

interface RequestFormPageProps {
  educationLevels: EducationLevel[]
  subjects: Subject[]
  _userId?: string
  editingRequest?: ResourceRequestWithRelations | null
}

export function RequestFormPage({
  educationLevels,
  subjects,
  _userId,
  editingRequest,
}: RequestFormPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: editingRequest?.title || '',
    description: editingRequest?.description || '',
    educationLevelId: editingRequest?.educationLevelId || '',
    subjectId: editingRequest?.subjectId || '',
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validar com Zod
      if (editingRequest) {
        const validatedData = updateResourceRequestSchema.parse({
          ...formData,
          id: editingRequest.id,
        })
        const result = await updateResourceRequest(validatedData)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success('Solicitação atualizada com sucesso')
          router.push('/requests')
        }
      } else {
        const validatedData = createResourceRequestSchema.parse(formData)
        const result = await createResourceRequest(validatedData)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success('Solicitação criada com sucesso')
          router.push('/requests')
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Mostrar primeiro erro de validação
        const firstError = error.issues[0]
        toast.error(firstError.message)
      } else {
        toast.error('Erro ao salvar solicitação')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {editingRequest ? 'Editar Solicitação' : 'Nova Solicitação'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {editingRequest
              ? 'Atualize os detalhes da sua solicitação'
              : 'Solicite um recurso pedagógico que gostaria de ver produzido'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg border border-gray-200 p-6">
        {/* Título */}
        <div className="space-y-2 w-full">
          <Label htmlFor="title" className="text-base font-medium">
            Título do Recurso <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            placeholder="Ex: Aula sobre Fotossíntese"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            maxLength={100}
            className="h-12 text-base w-full"
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Máximo 100 caracteres
            </p>
            <p className={`text-xs font-medium ${
              formData.title.length > 90 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {formData.title.length}/100
            </p>
          </div>
        </div>

        {/* Nível de Ensino e Disciplina */}
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nível de Ensino */}
          <div className="space-y-2 w-full">
            <Label htmlFor="level" className="text-base font-medium">
              Nível de Ensino <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.educationLevelId}
              onValueChange={(value) =>
                setFormData({ ...formData, educationLevelId: value })
              }
            >
              <SelectTrigger id="level" className="h-12 text-base w-full">
                <SelectValue placeholder="Selecione um nível" />
              </SelectTrigger>
              <SelectContent>
                {educationLevels.map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Disciplina */}
          <div className="space-y-2 w-full">
            <Label htmlFor="subject" className="text-base font-medium">
              Disciplina <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.subjectId}
              onValueChange={(value) =>
                setFormData({ ...formData, subjectId: value })
              }
            >
              <SelectTrigger id="subject" className="h-12 text-base w-full">
                <SelectValue placeholder="Selecione uma disciplina" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Descrição com Editor QL */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-base font-medium">
            Descrição Detalhada <span className="text-red-500">*</span>
          </Label>
          <div className="rounded-lg overflow-hidden bg-white">
            <Textarea
              placeholder="Descreva em detalhes como o material deve ser..."
              value={formData.description}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
              className="min-h-[200px] resize-y"
            />
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Mínimo 10 caracteres, máximo 5000
            </p>
            <p className={`text-xs font-medium ${
              formData.description.length > 4500 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {formData.description.length}/5000
            </p>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 justify-end pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
            className="h-11 px-6"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="h-11 px-6 gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {editingRequest ? 'Atualizar Solicitação' : 'Criar Solicitação'}
          </Button>
        </div>
      </form>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-sm text-blue-900 mb-2">
          💡 Dicas para uma boa solicitação
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Seja específico e claro sobre o que você precisa</li>
          <li>• Inclua detalhes sobre o público-alvo (série, faixa etária)</li>
          <li>• Mencione formatos preferidos (vídeo, PDF, apresentação, etc)</li>
          <li>• Quanto mais detalhes, maior a chance de ser produzido</li>
        </ul>
      </div>
    </div>
  )
}
