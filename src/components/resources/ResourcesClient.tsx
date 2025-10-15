// src/components/resources/ResourcesClient.tsx
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ResourceGrid } from './resource-grid'
import { FilterBar } from './filter-bar'
import { Spinner } from '@/components/ui/spinner'
import type { Resource } from '@/domain/resources/optimized-list.service'

type Subject = { id: string; name: string; slug: string }
type EducationLevel = { id: string; name: string; slug: string }

interface ApiResponse {
  accessibleResources: Resource[]
  restrictedResources: Resource[]
  pagination: { total: number; page: number; limit: number; hasMore: boolean }
}

const PAGE_SIZE = 12

export function ResourcesClient() {
  // filtros
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // dados
  const [accessibleResources, setAccessibleResources] = useState<Resource[]>([])
  const [restrictedResources, setRestrictedResources] = useState<Resource[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // estados
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // debounce da busca
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 350)
    return () => clearTimeout(t)
  }, [searchQuery])

  // sentinel para scroll infinito
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // abort de requests concorrentes
  const fetchCtrlRef = useRef<AbortController | null>(null)

  // monta querystring da API
  const queryString = useMemo(() => {
    const sp = new URLSearchParams()
    sp.set('page', String(page))
    sp.set('limit', String(PAGE_SIZE))
    if (selectedSubject !== 'all') sp.set('subjectId', selectedSubject)
    if (selectedLevel !== 'all') sp.set('educationLevelId', selectedLevel)
    if (debouncedQuery) sp.set('q', debouncedQuery)
    return sp.toString()
  }, [page, selectedSubject, selectedLevel, debouncedQuery])

  // metadados cacheados
  useEffect(() => {
    let cancelled = false
    async function bootstrap() {
      try {
        const [sRes, eRes] = await Promise.all([
          fetch('/api/v1/subjects/public', { cache: 'no-store' }),
          fetch('/api/v1/education-levels/public', { cache: 'no-store' })
        ])
        if (!sRes.ok || !eRes.ok) throw new Error('Falha nos metadados')
        const [sData, eData] = await Promise.all([sRes.json(), eRes.json()])
        if (!cancelled) {
          setSubjects(sData)
          setEducationLevels(eData)
        }
      } catch (e) {
        if (!cancelled) console.error('Erro metadados:', e)
      }
    }
    bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  // reset ao mudar filtros
  useEffect(() => {
    setAccessibleResources([])
    setRestrictedResources([])
    setPage(1)
    setHasMore(true)
    setError(null)
  }, [selectedSubject, selectedLevel, debouncedQuery])

  // carregar página
  useEffect(() => {
    let cancelled = false
    async function loadPage() {
      if (!hasMore && page > 1) return
      if (page === 1) setIsLoading(true)
      else setIsLoadingMore(true)

      if (fetchCtrlRef.current) fetchCtrlRef.current.abort()
      const ctrl = new AbortController()
      fetchCtrlRef.current = ctrl

      const useCache =
        selectedSubject === 'all' &&
        selectedLevel === 'all' &&
        !debouncedQuery &&
        page === 1

      try {
        const res = await fetch(`/api/v1/resources?${queryString}`, {
          signal: ctrl.signal,
          cache: useCache ? 'default' : 'no-store'
        })
        if (!res.ok) throw new Error('Falha ao buscar recursos')
        const data: ApiResponse = await res.json()
        if (cancelled) return

        setAccessibleResources(prev =>
          page === 1 ? data.accessibleResources : [...prev, ...data.accessibleResources]
        )
        setRestrictedResources(prev =>
          page === 1 ? data.restrictedResources : [...prev, ...data.restrictedResources]
        )
        setHasMore(data.pagination.hasMore)
        setError(null)
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return
        if (!cancelled) {
          console.error(e)
          setError('Erro ao carregar recursos')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
          setIsLoadingMore(false)
        }
      }
    }
    loadPage()
    return () => {
      cancelled = true
      if (fetchCtrlRef.current) fetchCtrlRef.current.abort()
    }
  }, [queryString, page, hasMore])

  // scroll infinito
  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
      const first = entries[0]
      if (first.isIntersecting && !isLoading && !isLoadingMore && hasMore) {
        setPage(p => p + 1)
      }
    })

    observerRef.current.observe(node)
    return () => observerRef.current?.disconnect()
  }, [isLoading, isLoadingMore, hasMore])

  const hasAnyResource = accessibleResources.length > 0 || restrictedResources.length > 0

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
        {isLoading && !hasAnyResource ? (
          <div className="flex h-60 items-center justify-center">
            <Spinner className="h-8 w-8 text-primary" />
          </div>
        ) : error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <div className="space-y-12">
            {accessibleResources.length > 0 && (
              <section>
                <h2 className="mb-6 text-2xl font-bold">Meus Recursos</h2>
                <ResourceGrid resources={accessibleResources} />
              </section>
            )}

            {restrictedResources.length > 0 && (
              <section>
                <h2 className="mb-6 text-2xl font-bold">Biblioteca Completa</h2>
                <ResourceGrid resources={restrictedResources} />
              </section>
            )}

            {hasMore && (
              <div ref={sentinelRef} className="flex justify-center py-8">
                {isLoadingMore && <Spinner className="h-8 w-8 text-primary" />}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
