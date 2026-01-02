'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, SlidersHorizontal, Search, Filter, BookOpen, GraduationCap, ChevronLeft, ChevronRight, X, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAdminResources } from '@/hooks/useAdminResources'
import { toast } from 'sonner'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  TemplateMainShell,
  TemplateMainHeader,
  DataToolbar,
  ViewSwitcher,
  type ViewType,
  ResourcesCardView,
  ResourcesTableView,
} from '@/components/client/resources'
import { ResourceEditDrawer } from '@/components/client/resources/resource-edit-drawer'
import { useResourceMeta } from '@/hooks/useResourceMeta'

// Options will be fetched from the API

export default function AdminResourcesPage() {
  const router = useRouter()
  const [view, setView] = useState<ViewType>('list')
  const isMobile = useIsMobile()
  const { data: metaData } = useResourceMeta()

  const EDUCATION_LEVEL_OPTIONS = metaData?.educationLevels || []
  const SUBJECT_OPTIONS = metaData?.subjects || []
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(15)
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['subject', 'educationLevel', 'isFree', 'createdAt'])
  const [isFreeOnly, setIsFreeOnly] = useState(false)
  const [resourceToEdit, setResourceToEdit] = useState<string | null>(null)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)

  // Filters
  const [educationLevel, setEducationLevel] = useState<string>('')
  const [subject, setSubject] = useState<string>('')

  // Search with debounce
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Debounce effect for search
  useEffect(() => {
    const trimmed = searchInput.trim()

    if (trimmed.length === 0) {
      if (searchQuery) {
        setSearchQuery('')
        setPage(1)
      }
      return undefined
    }

    if (trimmed.length < 2) {
      return undefined
    }

    if (trimmed === searchQuery) {
      return undefined
    }

    const handle = window.setTimeout(() => {
      setSearchQuery(trimmed)
      setPage(1)
    }, 400)

    return () => {
      window.clearTimeout(handle)
    }
  }, [searchInput, searchQuery])

  const { data: resourcesData, isLoading, error, refetch } = useAdminResources({
    filters: {
      page,
      limit,
      q: searchQuery,
      educationLevel: educationLevel || undefined,
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

  const handleViewResource = (resourceId: string) => {
    setResourceToEdit(resourceId)
    setIsEditDrawerOpen(true)
  }

  const handleEditResource = (resourceId: string) => {
    setResourceToEdit(resourceId)
    setIsEditDrawerOpen(true)
  }

  const handleEducationLevelChange = (value: string) => {
    setEducationLevel(value === educationLevel ? '' : value)
    setPage(1)
  }

  const handleSubjectChange = (value: string) => {
    setSubject(value === subject ? '' : value)
    setPage(1)
  }

  const handleIsFreeChange = (checked: boolean) => {
    setIsFreeOnly(checked)
    setPage(1)
  }

  const clearFilters = () => {
    setEducationLevel('')
    setSubject('')
    setIsFreeOnly(false)
    setPage(1)
  }

  const hasActiveFilters = educationLevel || subject || isFreeOnly

  const getEducationLevelLabel = () => {
    if (!educationLevel) return 'Nível'
    const option = EDUCATION_LEVEL_OPTIONS.find(o => o.key === educationLevel)
    return option?.label || 'Nível'
  }

  const getSubjectLabel = () => {
    if (!subject) return 'Disciplina'
    const option = SUBJECT_OPTIONS.find(o => o.key === subject)
    return option?.label || 'Disciplina'
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">Erro ao carregar recursos</p>
      </div>
    )
  }

  const resources = (resourcesData?.data ?? []).map(r => ({
    ...r,
    createdAt: new Date(r.createdAt),
    updatedAt: new Date(r.updatedAt),
  }))

  const handleCreateNew = () => {
    router.push('/admin/resources/new')
  }

  return (
    <>
      <TemplateMainShell className="flex flex-col h-full overflow-hidden">



        {/* MOBILE HEADER - Search + Filter Icon */}
        {isMobile && (
          <div className="flex items-center gap-3 border-b border-border bg-background px-3 pb-3 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar recursos..."
                className="h-10 rounded-full border-border bg-muted/50 pl-10 pr-4"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" size="icon" className={cn(
                  "h-10 w-10 shrink-0 rounded-full border-border",
                  hasActiveFilters && "border-primary bg-primary/10"
                )}>
                  <Filter className="h-4 w-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                  <DrawerHeader className="text-left px-6 pt-6">
                    <DrawerTitle className="text-lg">Filtros</DrawerTitle>
                  </DrawerHeader>

                  <div className="px-6 py-4 space-y-6">
                    {/* Nível de Educação */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-foreground">Nível de Educação</label>
                      <div className="grid grid-cols-2 gap-2">
                        {EDUCATION_LEVEL_OPTIONS.map((option) => (
                          <label
                            key={option.key}
                            className={cn(
                              "flex items-center justify-center gap-2 h-9 px-3 rounded-md border text-xs font-medium transition-colors cursor-pointer",
                              educationLevel === option.key
                                ? "bg-primary/10 border-primary text-primary"
                                : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                            )}
                          >
                            <input
                              type="radio"
                              name="educationLevel"
                              value={option.key}
                              checked={educationLevel === option.key}
                              onChange={(e) => handleEducationLevelChange(e.target.value)}
                              className="sr-only"
                            />
                            <span className="text-center">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Disciplina */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-foreground">Disciplina</label>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {SUBJECT_OPTIONS.map((option) => (
                          <label
                            key={option.key}
                            className={cn(
                              "flex items-center justify-center gap-2 h-9 px-3 rounded-md border text-xs font-medium transition-colors cursor-pointer",
                              subject === option.key
                                ? "bg-primary/10 border-primary text-primary"
                                : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                            )}
                          >
                            <input
                              type="radio"
                              name="subject"
                              value={option.key}
                              checked={subject === option.key}
                              onChange={(e) => handleSubjectChange(e.target.value)}
                              className="sr-only"
                            />
                            <span className="text-center">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Gratuitos apenas */}
                    <div className="flex items-center justify-between border-t border-border/50 pt-4">
                      <label htmlFor="mobile-is-free" className="text-sm font-semibold text-foreground cursor-pointer">
                        Apenas gratuitos
                      </label>
                      <Switch
                        id="mobile-is-free"
                        checked={isFreeOnly}
                        onCheckedChange={handleIsFreeChange}
                      />
                    </div>
                  </div>

                  <DrawerFooter className="px-6 pb-8 gap-2">
                    {hasActiveFilters && (
                      <Button variant="outline" className="w-full" onClick={clearFilters}>
                        Limpar Filtros
                      </Button>
                    )}
                    <DrawerClose asChild>
                      <Button className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90">
                        Aplicar Filtros
                      </Button>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        )}

        {/* DESKTOP HEADER + TOOLBAR */}
        {!isMobile && (
          <>
            <TemplateMainHeader
              title="Recursos"
              subtitle="Gerencie os recursos do sistema."
              icon={BookOpen}
            >
              <ViewSwitcher view={view} setView={setView} className="-ml-4 mt-2" />
            </TemplateMainHeader>

            <div className="border-b border-border bg-background/50 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/50">
              <DataToolbar
                searchValue={searchInput}
                onSearchChange={setSearchInput}
                searchPlaceholder="Buscar por título ou descrição..."
                filters={
                  <div className="flex items-center gap-2">
                    {/* Education Level Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                          educationLevel
                            ? "border-primary/20 bg-primary/10 text-primary"
                            : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
                        )}>
                          <GraduationCap className="h-3 w-3" />
                          <span>{getEducationLevelLabel()}</span>
                          {educationLevel && (
                            <X
                              className="h-3 w-3 ml-1 hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEducationLevel('')
                                setPage(1)
                              }}
                            />
                          )}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuLabel>Nível de Educação</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {EDUCATION_LEVEL_OPTIONS.map((option) => (
                          <DropdownMenuCheckboxItem
                            key={option.key}
                            checked={educationLevel === option.key}
                            onCheckedChange={() => handleEducationLevelChange(option.key)}
                          >
                            {option.label}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Subject Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                          subject
                            ? "border-primary/20 bg-primary/10 text-primary"
                            : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
                        )}>
                          <BookOpen className="h-3 w-3" />
                          <span>{getSubjectLabel()}</span>
                          {subject && (
                            <X
                              className="h-3 w-3 ml-1 hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSubject('')
                                setPage(1)
                              }}
                            />
                          )}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56 max-h-72 overflow-y-auto scrollbar-light">
                        <DropdownMenuLabel>Disciplina</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {SUBJECT_OPTIONS.map((option) => (
                          <DropdownMenuCheckboxItem
                            key={option.key}
                            checked={subject === option.key}
                            onCheckedChange={() => handleSubjectChange(option.key)}
                          >
                            {option.label}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Is Free Switch */}
                    <div className="flex items-center gap-2 ml-2">
                      <Switch
                        id="is-free"
                        checked={isFreeOnly}
                        onCheckedChange={handleIsFreeChange}
                      />
                      <Label htmlFor="is-free" className="text-xs text-muted-foreground cursor-pointer whitespace-nowrap">
                        Apenas gratuitos
                      </Label>
                    </div>

                    {/* Clear filters */}
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                        onClick={clearFilters}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Limpar
                      </Button>
                    )}
                  </div>
                }
                actions={
                  view === 'list' ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 gap-2 text-xs">
                          <SlidersHorizontal className="h-3.5 w-3.5" />
                          <span>Exibir</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Colunas Visíveis</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                          checked={visibleColumns.includes('subject')}
                          onCheckedChange={() => toggleColumn('subject')}
                        >
                          Disciplina
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={visibleColumns.includes('educationLevel')}
                          onCheckedChange={() => toggleColumn('educationLevel')}
                        >
                          Nível de Educação
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={visibleColumns.includes('isFree')}
                          onCheckedChange={() => toggleColumn('isFree')}
                        >
                          Tipo (Gratuito/Pago)
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={visibleColumns.includes('createdAt')}
                          onCheckedChange={() => toggleColumn('createdAt')}
                        >
                          Data de Criação
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null
                }
              />
            </div>
          </>
        )}

        {/* CONTENT AREA */}
        <div className={cn(
          "flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border",
          isMobile ? "p-3" : "p-6"
        )}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Carregando recursos...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-destructive">Erro ao carregar recursos</p>
            </div>
          ) : isMobile ? (
            <ResourcesCardView
              resources={resources}
              onView={handleViewResource}
              onEdit={handleEditResource}
              onDelete={handleDeleteResource}
            />
          ) : (
            <>
              {view === 'list' && (
                <ResourcesTableView
                  resources={resources}
                  visibleColumns={visibleColumns}
                  onView={handleViewResource}
                  onEdit={handleEditResource}
                  onDelete={handleDeleteResource}
                />
              )}
              {view === 'cards' && (
                <ResourcesCardView
                  resources={resources}
                  onView={handleViewResource}
                  onEdit={handleEditResource}
                  onDelete={handleDeleteResource}
                />
              )}
            </>
          )}
        </div>

        {/* PAGINATION */}
        <div className="border-t border-border bg-background px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                Mostrando <span className="font-medium">{resources.length}</span> de <span className="font-medium">{resourcesData?.pagination.total || 0}</span> recursos
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Itens por página:</span>
                <Select
                  value={limit.toString()}
                  onValueChange={(value) => {
                    setLimit(Number(value))
                    setPage(1)
                  }}
                >
                  <SelectTrigger size="sm" className="h-8 w-[70px]">
                    <SelectValue placeholder={limit.toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 15, 20, 50, 100].map((value) => (
                      <SelectItem key={value} value={value.toString()}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1 || isLoading}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Anterior
              </Button>

              <div className="flex items-center gap-1 mx-1">
                {Array.from({ length: Math.min(5, resourcesData?.pagination.totalPages || 0) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "ghost"}
                      size="sm"
                      className="h-8 w-8 text-xs p-0"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                {(resourcesData?.pagination.totalPages || 0) > 5 && (
                  <span className="text-xs text-muted-foreground px-1">...</span>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={() => setPage(prev => Math.min(resourcesData?.pagination.totalPages || 1, prev + 1))}
                disabled={!resourcesData?.pagination.hasMore || isLoading}
              >
                Próximo
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

      </TemplateMainShell>

      <Button
        onClick={handleCreateNew}
        size="icon"
        className="fixed bottom-20 right-8 h-14 w-14 rounded-full shadow-2xl hover:shadow-primary/50 hover:scale-110 transition-all z-50"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <ResourceEditDrawer
        resourceId={resourceToEdit}
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        onSuccess={refetch}
      />
    </>
  )
}
