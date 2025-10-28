'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { RequestDetailModal } from '@/components/requests/request-detail-modal'
import { RequestFiltersSheet } from '@/components/requests/request-filters-sheet'
import { RequestKanban } from '@/components/requests/request-kanban'
import { RequestTabs } from '@/components/requests/request-tabs'
import { ResourceRequestWithRelations } from '@/types/request'
import { deleteResourceRequest } from './actions'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { useSession } from '@/lib/auth/auth-client'

type RequestsEnvConfig = {
  baseUrl: string
}

const requestsEnvConfig: RequestsEnvConfig = (() => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL não configurada.')
  }

  return { baseUrl }
})()

// Remover isLoading manual e integrar com Suspense

interface EducationLevel {
  id: string
  name: string
}

interface Subject {
  id: string
  name: string
}

export default function RequestPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user
  const [requests, setRequests] = useState<ResourceRequestWithRelations[]>([])
  const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ResourceRequestWithRelations | null>(null)
  const [filters, setFilters] = useState({
    educationLevelId: undefined as string | undefined,
    subjectId: undefined as string | undefined,
    myRequests: false,
  })

  // Carregar metadata
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`${requestsEnvConfig.baseUrl}/api/v1/requests/metadata`)
        
        if (!response.ok) {
          throw new Error('Erro ao buscar metadata')
        }
        
        const data = await response.json()
        setEducationLevels(data.educationLevels)
        setSubjects(data.subjects)
      } catch {
        toast.error('Erro ao carregar dados')
      }
    }

    loadData()
  }, [])

  // Carregar requests com filtros
  const loadRequests = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      
      if (filters.educationLevelId) {
        params.set('educationLevelId', filters.educationLevelId)
      }
      if (filters.subjectId) {
        params.set('subjectId', filters.subjectId)
      }
      if (filters.myRequests) {
        params.set('myRequests', 'true')
      }

      const response = await fetch(`${requestsEnvConfig.baseUrl}/api/v1/requests?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar solicitações')
      }

      const data = await response.json()
      setRequests(data)
    } catch {
      toast.error('Erro ao carregar solicitações')
    }
  }, [filters])

  // Carregar requests inicialmente e quando filtros mudam
  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  // Recarregar quando página fica visível (volta de outra página)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadRequests()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [loadRequests])

  const handleFiltersChange = (newFilters: {
    educationLevelId?: string
    subjectId?: string
    myRequests?: boolean
  }) => {
    setFilters({
      educationLevelId: newFilters.educationLevelId,
      subjectId: newFilters.subjectId,
      myRequests: newFilters.myRequests || false,
    })
  }

  const handleEdit = (request: ResourceRequestWithRelations) => {
    router.push(`/requests/${request.id}/edit`)
  }

  // Quando volta de /requests/new, recarregar a lista
  useEffect(() => {
    const handleRouterChange = () => {
      loadRequests()
    }

    // Usar router events ou visibility API
    window.addEventListener('focus', handleRouterChange)
    return () => window.removeEventListener('focus', handleRouterChange)
  }, [loadRequests])

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta solicitação?')) {
      try {
        const result = await deleteResourceRequest(id)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success('Solicitação deletada com sucesso')
          setRequests(requests.filter((r) => r.id !== id))
          setDetailModalOpen(false)
        }
      } catch {
        toast.error('Erro ao deletar solicitação')
      }
    }
  }

  // Remover o if(isLoading), confiar no loading.tsx via Suspense
  return (
    <div className="h-screen flex flex-col bg-gray-50 pb-20">
      <div className="max-w-[1920px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-4 mb-4 shrink-0">
          {/* Título e Subtítulo */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              Solicitações de Recursos
            </h1>
            <p className="text-gray-600 text-sm mt-2">
              Solicite recursos pedagógicos que a comunidade mais votada será produzida
            </p>
          </div>

          {/* Filtro - Desktop */}
          <div className="hidden sm:flex shrink-0">
            <RequestFiltersSheet
              educationLevels={educationLevels}
              subjects={subjects}
              onFiltersChange={handleFiltersChange}
            />
          </div>
        </div>

        {/* Usar Suspense para Kanban e Tabs */}
        <Suspense fallback={<div className="flex items-center justify-center h-40"><p>Carregando lista...</p></div>}>
          <RequestKanban
            requests={requests}
            currentUserId={user?.id}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetails={(request) => {
              setSelectedRequest(request)
              setDetailModalOpen(true)
            }}
          />

          <RequestTabs
            requests={requests}
            currentUserId={user?.id}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetails={(request) => {
              setSelectedRequest(request)
              setDetailModalOpen(true)
            }}
            filtersTrigger={
              <RequestFiltersSheet
                educationLevels={educationLevels}
                subjects={subjects}
                onFiltersChange={handleFiltersChange}
              />
            }
          />
        </Suspense>

        {/* Detail Modal */}
        <RequestDetailModal
          request={selectedRequest}
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          currentUserId={user?.id}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Floating Action Button - Acima da bottom nav */}
      <div className="fixed bottom-20 right-6 z-40">
        <Button
          onClick={() => router.push('/requests/new')}
          className="rounded-full shadow-lg h-14 w-14 p-0 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus size={24} />
        </Button>
      </div>
    </div>
  )
}
