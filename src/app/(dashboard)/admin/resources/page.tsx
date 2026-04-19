'use client'

import React, { useDeferredValue, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, BookOpen, GraduationCap, X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  useAdminResources,
  useDeleteAdminResource,
} from '@/hooks/resources/use-admin-resources'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/index'
import { CrudPageShell } from '@/components/dashboard/crud/crud-page-shell'
import { CrudDataView } from '@/components/dashboard/crud/crud-data-view'
import { ViewType } from '@/components/dashboard/crud/types'
import {
  ResourcesGridVirtuoso,
  ResourcesTableVirtuoso,
} from '@/components/dashboard/resources'
import { useResourceMeta } from '@/hooks/resources/use-resources'
import { useMobile } from '@/hooks/layout/use-mobile'

export default function AdminResourcesPage() {
  const router = useRouter()
  const { isMobile } = useMobile()
  const [view, setView] = useState<ViewType>('list')
  const { data: metaData } = useResourceMeta()

  const EDUCATION_LEVEL_OPTIONS = metaData?.educationLevels || []
  const SUBJECT_OPTIONS = metaData?.subjects || []

  const [limit, setLimit] = useState(15)
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['subject', 'educationLevel', 'createdAt'])

  // Filters
  const [educationLevel, setEducationLevel] = useState<string>('')
  const [subject, setSubject] = useState<string>('')
  const [grade, setGrade] = useState<string>('')

  // Search with debounce
  const [searchInput, setSearchInput] = useState('')
  const deferredSearchInput = useDeferredValue(searchInput)
  const searchQuery = deferredSearchInput.trim().length >= 3 ? deferredSearchInput : ''
  const deleteResourceMutation = useDeleteAdminResource()

  const { 
    data: items, 
    isLoading, 
    error, 
    refetch, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    pagination 
  } = useAdminResources({
    filters: {
      limit,
      q: searchQuery,
      educationLevel: educationLevel || undefined,
      grade: grade || undefined,
      subject: subject || undefined,
    },
  })

  const toggleColumn = (columnId: string) => {
    setVisibleColumns(prev =>
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    )
  }

  const handleDeleteResource = (resourceId: string) => {
    if (!confirm('Tem certeza que deseja deletar este recurso?')) return
    toast.info('Deletando recurso...')
    deleteResourceMutation.mutate(resourceId, {
      onSuccess: () => {
        toast.success('Recurso deletado com sucesso')
        refetch()
      },
      onError: () => {
        toast.error('Erro ao deletar recurso')
      },
    })
  }

  const handleEditResource = (resourceId: string) => {
    router.push(`/resources/${resourceId}`)
  }

  const clearFilters = () => {
    setEducationLevel('')
    setSubject('')
    setGrade('')
  }

  const getEducationLevelLabel = () => {
    if (!educationLevel) return 'Nível'
    return EDUCATION_LEVEL_OPTIONS.find(o => o.key === educationLevel)?.label || 'Nível'
  }

  const getSubjectLabel = () => {
    if (!subject) return 'Disciplina'
    return SUBJECT_OPTIONS.find(o => o.key === subject)?.label || 'Disciplina'
  }

  const getGradeLabel = () => {
    if (!grade) return 'Série/Ano'
    return metaData?.grades?.find(o => o.key === grade)?.label || 'Série/Ano'
  }

  const hasActiveFilters = educationLevel || subject || grade

  const filteredGrades = (metaData?.grades || []).filter(
    (g) => !educationLevel || g.educationLevelKey === educationLevel
  )

  const filtersComponent = (
    <div className={cn("flex items-center gap-2", isMobile && "flex-col items-stretch gap-4")}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={cn(
            "h-8 gap-1.5 border-dashed text-xs rounded-full",
            educationLevel && "border-primary bg-primary/10 text-primary"
          )}>
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Nível: {getEducationLevelLabel()}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {EDUCATION_LEVEL_OPTIONS.map((opt) => (
            <DropdownMenuCheckboxItem
              key={opt.key}
              checked={educationLevel === opt.key}
              onCheckedChange={() => {
                setEducationLevel(educationLevel === opt.key ? '' : opt.key)
              }}
            >
              {opt.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={cn(
            "h-8 gap-1.5 border-dashed text-xs rounded-full",
            subject && "border-primary bg-primary/10 text-primary"
          )}>
            <BookOpen className="h-3.5 w-3.5" />
            <span>Disciplina: {getSubjectLabel()}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 max-h-72 overflow-y-auto">
          {SUBJECT_OPTIONS.map((opt) => (
            <DropdownMenuCheckboxItem
              key={opt.key}
              checked={subject === opt.key}
              onCheckedChange={() => {
                setSubject(subject === opt.key ? '' : opt.key)
              }}
            >
              {opt.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={cn(
            "h-8 gap-1.5 border-dashed text-xs rounded-full",
            grade && "border-primary bg-primary/10 text-primary"
          )}>
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Ano: {getGradeLabel()}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 max-h-72 overflow-y-auto">
          {filteredGrades.map((opt) => (
            <DropdownMenuCheckboxItem
              key={opt.key}
              checked={grade === opt.key}
              onCheckedChange={() => {
                setGrade(grade === opt.key ? '' : opt.key)
              }}
            >
              {opt.label}
              <span className="ml-auto text-[9px] text-muted-foreground ml-2 opacity-50">{opt.educationLevelKey}</span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>


      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={clearFilters}
        >
          <X className="h-3.5 w-3.5" />
          Limpar
        </Button>
      )}
    </div>
  )

  const resources = items.map(r => ({
    ...r,
    createdAt: new Date(r.createdAt),
    updatedAt: new Date(r.updatedAt),
  }))

  return (
    <>
      <CrudPageShell
        title="Recursos"
        subtitle="Gerencie os arquivos, PDFs e materiais do sistema."
        icon={BookOpen}
        view={view}
        setView={setView}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Buscar por título ou descrição..."
        page={pagination?.page ?? 1}
        limit={limit}
        onPageChange={() => {}}
        onLimitChange={setLimit}
        totalItems={pagination?.total ?? 0}
        totalPages={pagination?.totalPages ?? 0}
        hasMore={hasNextPage ?? false}
        isLoading={isLoading}
        filters={filtersComponent}
        onAdd={() => {
          router.push('/admin/resources/create')
        }}
        actions={
          view === 'list' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2 text-xs rounded-lg">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Colunas</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground tracking-widest font-bold">Colunas Visíveis</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked={visibleColumns.includes('subject')} onCheckedChange={() => toggleColumn('subject')}>Disciplina</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={visibleColumns.includes('educationLevel')} onCheckedChange={() => toggleColumn('educationLevel')}>Nível</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={visibleColumns.includes('grades')} onCheckedChange={() => toggleColumn('grades')}>Anos / Séries</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={visibleColumns.includes('createdAt')} onCheckedChange={() => toggleColumn('createdAt')}>Data</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }
      >
        <div className="p-4 md:p-6 pb-20">
          <CrudDataView
            data={resources}
            view={view}
            tableView={
              <ResourcesTableVirtuoso
                resources={resources as any}
                visibleColumns={visibleColumns}
                onView={handleEditResource}
                onEdit={handleEditResource}
                onDelete={handleDeleteResource}
                onEndReached={() => hasNextPage && fetchNextPage()}
              />
            }
            cardView={
              <ResourcesGridVirtuoso
                resources={resources as any}
                onView={handleEditResource}
                onEdit={handleEditResource}
                onDelete={handleDeleteResource}
                onEndReached={() => hasNextPage && fetchNextPage()}
              />
            }
          />
          
          {isFetchingNextPage && (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            </div>
          )}
        </div>
      </CrudPageShell>
    </>
  )
}
