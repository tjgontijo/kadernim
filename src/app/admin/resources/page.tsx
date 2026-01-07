'use client'

import React, { useState, useEffect } from 'react'
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
import { useAdminResources } from '@/hooks/use-admin-resources'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { CrudPageShell } from '@/components/admin/crud/crud-page-shell'
import { CrudDataView } from '@/components/admin/crud/crud-data-view'
import { ViewType } from '@/components/admin/crud/types'
import {
  ResourcesCardView,
  ResourcesTableView,
} from '@/components/client/resources'
import { ResourceEditDrawer } from '@/components/client/resources/resource-edit-drawer'
import { ResourceCreateDrawer } from '@/components/client/resources/resource-create-drawer'
import { useResourceMeta } from '@/hooks/use-resource-meta'
import { useBreakpoint } from '@/hooks/use-breakpoint'

export default function AdminResourcesPage() {
  const router = useRouter()
  const { isMobile } = useBreakpoint()
  const [view, setView] = useState<ViewType>('list')
  const { data: metaData } = useResourceMeta()

  const EDUCATION_LEVEL_OPTIONS = metaData?.educationLevels || []
  const SUBJECT_OPTIONS = metaData?.subjects || []

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(15)
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['subject', 'educationLevel', 'isFree', 'createdAt'])
  const [isFreeOnly, setIsFreeOnly] = useState(false)
  const [resourceToEdit, setResourceToEdit] = useState<string | null>(null)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false)

  // Filters
  const [educationLevel, setEducationLevel] = useState<string>('')
  const [subject, setSubject] = useState<string>('')
  const [grade, setGrade] = useState<string>('')

  // Search with debounce
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearchQuery(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(handle)
  }, [searchInput])

  const { data: resourcesData, isLoading, error, refetch } = useAdminResources({
    filters: {
      page,
      limit,
      q: searchQuery,
      educationLevel: educationLevel || undefined,
      grade: grade || undefined,
      subject: subject || undefined,
      isFree: isFreeOnly ? true : undefined,
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
    fetch(`/api/v1/admin/resources/${resourceId}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao deletar')
        toast.success('Recurso deletado com sucesso')
        refetch()
      })
      .catch(() => {
        toast.error('Erro ao deletar recurso')
      })
  }

  const handleEditResource = (resourceId: string) => {
    setResourceToEdit(resourceId)
    setIsEditDrawerOpen(true)
  }

  const clearFilters = () => {
    setEducationLevel('')
    setSubject('')
    setGrade('')
    setIsFreeOnly(false)
    setPage(1)
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

  const hasActiveFilters = educationLevel || subject || grade || isFreeOnly

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
                setPage(1)
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
                setPage(1)
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
                setPage(1)
              }}
            >
              {opt.label}
              <span className="ml-auto text-[9px] text-muted-foreground ml-2 opacity-50">{opt.educationLevelKey}</span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className={cn("flex items-center gap-2 px-2", isMobile && "pt-2 border-t mt-2")}>
        <Switch
          id="is-free-crud"
          checked={isFreeOnly}
          onCheckedChange={(checked) => {
            setIsFreeOnly(checked)
            setPage(1)
          }}
        />
        <Label htmlFor="is-free-crud" className="text-xs font-medium cursor-pointer">
          Apenas Gratuitos
        </Label>
      </div>

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

  const resources = (resourcesData?.data ?? []).map(r => ({
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
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        totalItems={resourcesData?.pagination.total ?? 0}
        totalPages={resourcesData?.pagination.totalPages ?? 0}
        hasMore={resourcesData?.pagination.hasMore ?? false}
        isLoading={isLoading}
        filters={filtersComponent}
        onAdd={() => setIsCreateDrawerOpen(true)}
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
                <DropdownMenuCheckboxItem checked={visibleColumns.includes('isFree')} onCheckedChange={() => toggleColumn('isFree')}>Status (Pago/Grátis)</DropdownMenuCheckboxItem>
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
              <ResourcesTableView
                resources={resources as any}
                visibleColumns={visibleColumns}
                onView={handleEditResource}
                onEdit={handleEditResource}
                onDelete={handleDeleteResource}
              />
            }
            cardView={
              <ResourcesCardView
                resources={resources as any}
                onView={handleEditResource}
                onEdit={handleEditResource}
                onDelete={handleDeleteResource}
              />
            }
          />
        </div>
      </CrudPageShell>

      <ResourceCreateDrawer
        open={isCreateDrawerOpen}
        onOpenChange={setIsCreateDrawerOpen}
        onSuccess={(newResource) => {
          handleEditResource(newResource.id)
        }}
      />

      <ResourceEditDrawer
        resourceId={resourceToEdit}
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        onSuccess={refetch}
      />
    </>
  )
}
