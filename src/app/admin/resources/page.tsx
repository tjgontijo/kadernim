'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, SlidersHorizontal, Search, Filter, Calendar, ArrowUpDown } from 'lucide-react'
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
import { useAdminResources, useDeleteAdminResource } from '@/hooks/useAdminResources'
import { toast } from 'sonner'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import {
  TemplateMainShell,
  TemplateMainHeader,
  DataToolbar,
  ViewSwitcher,
  type ViewType,
  ResourcesCardView,
  ResourcesTableView,
} from '@/components/dashboard/resources'

type SortBy = 'title' | 'createdAt' | 'updatedAt'
type Order = 'asc' | 'desc'

const SORT_OPTIONS = [
  { value: 'title', label: 'Título' },
  { value: 'createdAt', label: 'Data de Criação' },
  { value: 'updatedAt', label: 'Última Atualização' },
]

const ORDER_OPTIONS = [
  { value: 'desc', label: 'Decrescente' },
  { value: 'asc', label: 'Crescente' },
]

export default function AdminResourcesPage() {
  const router = useRouter()
  const [view, setView] = useState<ViewType>('list')
  const isMobile = useIsMobile()
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [sortBy, setSortBy] = useState<SortBy>('updatedAt')
  const [order, setOrder] = useState<Order>('desc')
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['subject', 'educationLevel', 'isFree', 'createdAt'])
  const [isFreeOnly, setIsFreeOnly] = useState(false)

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
      sortBy,
      order,
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

    // Note: Using delete mutation inline for simplicity
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
    router.push(`/admin/resources/${resourceId}/edit`)
  }

  const handleEditResource = (resourceId: string) => {
    router.push(`/admin/resources/${resourceId}/edit`)
  }

  const handleSortByChange = (newSortBy: string) => {
    setSortBy(newSortBy as SortBy)
    setPage(1)
  }

  const handleOrderChange = (newOrder: string) => {
    setOrder(newOrder as Order)
    setPage(1)
  }

  const handleIsFreeChange = (checked: boolean) => {
    setIsFreeOnly(checked)
    setPage(1)
  }

  const getSortLabel = () => {
    const option = SORT_OPTIONS.find(o => o.value === sortBy)
    return option?.label || 'Ordenar'
  }

  const getOrderLabel = () => {
    const option = ORDER_OPTIONS.find(o => o.value === order)
    return option?.label || 'Ordem'
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

      <TemplateMainShell className="flex flex-col h-[calc(100vh-2rem)]">

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
                <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-full border-border">
                  <Filter className="h-4 w-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                  <DrawerHeader className="text-left px-6 pt-6">
                    <DrawerTitle className="text-lg">Filtros</DrawerTitle>
                  </DrawerHeader>

                  <div className="px-6 py-4 space-y-6">
                    {/* Ordenar por */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-foreground">Ordenar por</label>
                      <div className="grid grid-cols-2 gap-2">
                        {SORT_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            className={cn(
                              "flex items-center justify-center gap-2 h-9 px-3 rounded-md border text-xs font-medium transition-colors cursor-pointer",
                              sortBy === option.value
                                ? "bg-primary/10 border-primary text-primary"
                                : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                            )}
                          >
                            <input
                              type="radio"
                              name="sortBy"
                              value={option.value}
                              checked={sortBy === option.value}
                              onChange={(e) => handleSortByChange(e.target.value)}
                              className="sr-only"
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Ordem */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-foreground">Ordem</label>
                      <div className="grid grid-cols-2 gap-2">
                        {ORDER_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            className={cn(
                              "flex items-center justify-center gap-2 h-9 px-3 rounded-md border text-xs font-medium transition-colors cursor-pointer",
                              order === option.value
                                ? "bg-primary/10 border-primary text-primary"
                                : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                            )}
                          >
                            <input
                              type="radio"
                              name="order"
                              value={option.value}
                              checked={order === option.value}
                              onChange={(e) => handleOrderChange(e.target.value)}
                              className="sr-only"
                            />
                            <span>{option.label}</span>
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

                  <DrawerFooter className="px-6 pb-8">
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
            <TemplateMainHeader>
              <ViewSwitcher view={view} setView={setView} className="-ml-4 mt-2" />
            </TemplateMainHeader>

            <div className="border-b border-border bg-background/50 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/50">
              <DataToolbar
                searchValue={searchInput}
                onSearchChange={setSearchInput}
                searchPlaceholder="Buscar por título, assunto..."
                filters={
                  <div className="flex items-center gap-2">
                    {/* Sort By Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20">
                          <ArrowUpDown className="h-3 w-3" />
                          <span>Ordenar: {getSortLabel()}</span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {SORT_OPTIONS.map((option) => (
                          <DropdownMenuCheckboxItem
                            key={option.value}
                            checked={sortBy === option.value}
                            onCheckedChange={() => handleSortByChange(option.value)}
                          >
                            {option.label}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Order Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                          "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
                        )}>
                          <Calendar className="h-3 w-3" />
                          <span>Ordem: {getOrderLabel()}</span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuLabel>Ordem</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {ORDER_OPTIONS.map((option) => (
                          <DropdownMenuCheckboxItem
                            key={option.value}
                            checked={order === option.value}
                            onCheckedChange={() => handleOrderChange(option.value)}
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
                          Assunto
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
        <div className={isMobile
          ? "flex-1 overflow-y-scroll bg-muted/5 p-3 scrollbar-hide"
          : "flex-1 overflow-y-auto bg-muted/5 p-6"
        }>
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

      </TemplateMainShell>

      {/* FAB - Floating Action Button */}
      <Button
        onClick={handleCreateNew}
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl hover:shadow-primary/50 hover:scale-110 transition-all z-50"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </>
  )
}
