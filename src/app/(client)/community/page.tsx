'use client'

import { useState, useMemo, useEffect } from 'react'
import { Plus, Filter, Loader2, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import { VoteProgress } from '@/components/client/community/vote-progress'
import { RequestCard } from '@/components/client/community/request-card'
import { CreateRequestDrawer } from '@/components/client/community/create-request-drawer'
import { EmptyState as CommunityEmptyState } from '@/components/client/community/empty-state'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Skeleton } from '@/components/ui/skeleton'
import { useCommunityUsage } from '@/hooks/use-community-usage'
import { triggerConfetti } from '@/lib/utils/confetti'
import { PageScaffold } from '@/components/client/shared/page-scaffold'
import { SearchInput } from '@/components/client/shared/search-input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface FilterOption {
    slug: string
    name: string
}

export default function CommunityPage() {
    const { isMobile } = useBreakpoint()
    const [mounted, setMounted] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')

    useEffect(() => {
        setMounted(true)
    }, [])

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery)
        }, 400)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const queryClient = useQueryClient()
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
    const [createDrawerOpen, setCreateDrawerOpen] = useState(false)
    const { data: usage, isLoading: isLoadingUsage } = useCommunityUsage()

    // Estados para os filtros cascateados
    const [level, setLevel] = useState<string>('all')
    const [grade, setGrade] = useState<string>('all')
    const [subject, setSubject] = useState<string>('all')

    // Opções para os dropdowns
    const [levels, setLevels] = useState<FilterOption[]>([])
    const [grades, setGrades] = useState<FilterOption[]>([])
    const [subjects, setSubjects] = useState<FilterOption[]>([])

    // Carregar Etapas ao montar
    useEffect(() => {
        fetch('/api/v1/education-levels')
            .then(res => res.json())
            .then(data => { if (data.success) setLevels(data.data); });
    }, [])

    // Carregar Anos quando Etapa mudar
    useEffect(() => {
        if (level === 'all') {
            setGrades([]);
            setGrade('all');
            return;
        }
        fetch(`/api/v1/grades?educationLevelSlug=${level}`)
            .then(res => res.json())
            .then(data => { if (data.success) setGrades(data.data); });

        setGrade('all');
        setSubject('all');
    }, [level])

    // Carregar Disciplinas quando Ano mudar
    useEffect(() => {
        if (grade === 'all' && level === 'all') {
            setSubjects([]);
            setSubject('all');
            return;
        }

        const params = new URLSearchParams();
        if (level !== 'all') params.append('educationLevelSlug', level);
        if (grade !== 'all') params.append('gradeSlug', grade);

        fetch(`/api/v1/subjects?${params.toString()}`)
            .then(res => res.json())
            .then(data => { if (data.success) setSubjects(data.data); });

        setSubject('all');
    }, [grade, level])

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (level !== 'all') count++;
        if (grade !== 'all') count++;
        if (subject !== 'all') count++;
        return count;
    }, [level, grade, subject])

    const clearFilters = () => {
        setLevel('all');
        setGrade('all');
        setSubject('all');
        setFilterDrawerOpen(false);
    }

    const {
        data,
        isLoading,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
    } = useInfiniteQuery({
        queryKey: ['community.requests', debouncedQuery, level, grade, subject],
        queryFn: async ({ pageParam = 1 }) => {
            const params = new URLSearchParams({
                page: String(pageParam),
                limit: '12',
                ...(debouncedQuery && { q: debouncedQuery }),
                ...(level !== 'all' && { educationLevelSlug: level }),
                ...(grade !== 'all' && { gradeSlug: grade }),
                ...(subject !== 'all' && { subjectSlug: subject })
            })
            const res = await fetch(`/api/v1/community/requests?${params}`)
            if (!res.ok) throw new Error('Erro ao carregar pedidos')
            return res.json()
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { page, totalPages } = lastPage.data
            return page < totalPages ? page + 1 : undefined
        },
    })

    const voteMutation = useMutation({
        mutationFn: async (requestId: string) => {
            const res = await fetch(`/api/v1/community/requests/${requestId}/vote`, {
                method: 'POST',
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Erro ao votar')
            }
            return res.json()
        },
        onSuccess: () => {
            toast.success('Voto computado com sucesso!', { icon: '💖' })
            triggerConfetti()
            queryClient.invalidateQueries({ queryKey: ['community.requests'] })
            queryClient.invalidateQueries({ queryKey: ['community.usage'] })
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const requests = useMemo(() => {
        return data?.pages.flatMap(page => page.data.items) || []
    }, [data])

    return (
        <PageScaffold>
            {/* LINHA 1: Header */}
            <PageScaffold.Header
                title={<>Pedidos da <span className="text-primary italic">Comunidade</span></>}
                action={
                    <Button
                        variant="outline"
                        onClick={() => setCreateDrawerOpen(true)}
                        className="h-10 sm:h-12 px-4 sm:px-6 rounded-2xl border-primary/20 text-primary hover:bg-primary/5 font-bold transition-all group shrink-0"
                    >
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 group-hover:rotate-90 transition-transform" />
                        Sugerir
                    </Button>
                }
            />

            {/* LINHA 2: Highlight (Progresso) */}
            {!isLoadingUsage && usage && (
                <PageScaffold.Highlight>
                    <VoteProgress used={usage.used} total={usage.limit} />
                </PageScaffold.Highlight>
            )}

            {/* LINHA 3: Controls (Busca e Filtro) */}
            <PageScaffold.Controls>
                <SearchInput
                    placeholder="Buscar pedidos ou descrições..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClear={() => setSearchQuery('')}
                    isLoading={isLoading && searchQuery !== debouncedQuery}
                />

                {mounted && (
                    <Drawer open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen}>
                        <DrawerTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-11 sm:h-12 w-11 sm:w-12 rounded-2xl border-border/50 shrink-0 relative"
                            >
                                <Filter className="h-4 w-4" />
                                {activeFiltersCount > 0 && (
                                    <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-black text-primary-foreground shadow-lg shadow-primary/20 ring-2 ring-background">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent className="rounded-t-[32px] p-6">
                            <DrawerHeader>
                                <DrawerTitle className="text-2xl font-black text-center">Filtrar Pedidos</DrawerTitle>
                                <DrawerDescription className="sr-only">Ajuste os filtros para organizar os pedidos da comunidade.</DrawerDescription>
                            </DrawerHeader>
                            <div className="py-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Etapa de Ensino</label>
                                        <Select value={level} onValueChange={setLevel}>
                                            <SelectTrigger className="h-14 w-full bg-muted/30 border-border/50 rounded-2xl text-sm font-bold">
                                                <SelectValue placeholder="Todas as Etapas" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-border/50">
                                                <SelectItem value="all">Todas as Etapas</SelectItem>
                                                {levels.map(l => <SelectItem key={l.slug} value={l.slug}>{l.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ano / Série</label>
                                        <Select value={grade} onValueChange={setGrade} disabled={level === 'all'}>
                                            <SelectTrigger className="h-14 w-full bg-muted/30 border-border/50 rounded-2xl text-sm font-bold">
                                                <SelectValue placeholder={level === 'educacao-infantil' ? 'Faixa Etária' : 'Ano/Série'} />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-border/50">
                                                <SelectItem value="all">Todos os Anos</SelectItem>
                                                {grades.map(g => <SelectItem key={g.slug} value={g.slug}>{g.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Componente / Campo</label>
                                        <Select value={subject} onValueChange={setSubject} disabled={grade === 'all' && level !== 'educacao-infantil'}>
                                            <SelectTrigger className="h-14 w-full bg-muted/30 border-border/50 rounded-2xl text-sm font-bold">
                                                <SelectValue placeholder={level === 'educacao-infantil' ? 'Campo de Exp.' : 'Componente'} />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-border/50">
                                                <SelectItem value="all">Todos os Componentes</SelectItem>
                                                {subjects.map(s => <SelectItem key={s.slug} value={s.slug}>{s.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        className="h-14 flex-1 rounded-2xl font-bold"
                                        onClick={clearFilters}
                                    >
                                        Limpar
                                    </Button>
                                    <Button
                                        className="h-14 flex-1 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20"
                                        onClick={() => setFilterDrawerOpen(false)}
                                    >
                                        Ver Resultados
                                    </Button>
                                </div>
                            </div>
                        </DrawerContent>
                    </Drawer>
                )}
            </PageScaffold.Controls>

            {/* Grid de Pedidos */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 sm:px-0">
                {isLoading && requests.length === 0 ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-[320px] rounded-3xl overflow-hidden border border-border/50">
                            <Skeleton className="h-full w-full" />
                        </div>
                    ))
                ) : requests.length > 0 ? (
                    requests.map((request, index) => (
                        <RequestCard
                            key={request.id}
                            request={request}
                            onVote={(id) => voteMutation.mutate(id)}
                            isVoting={voteMutation.isPending}
                            rank={index + 1}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-10">
                        <CommunityEmptyState onCreateClick={() => setCreateDrawerOpen(true)} />
                    </div>
                )}
            </section>

            {/* Load More */}
            {hasNextPage && (
                <div className="flex justify-center pt-10">
                    <Button
                        variant="ghost"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="h-14 px-10 rounded-2xl font-black text-primary hover:bg-primary/5 transition-all"
                    >
                        {isFetchingNextPage ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                            'Carregar Mais Pedidos'
                        )}
                    </Button>
                </div>
            )}

            <CreateRequestDrawer
                open={createDrawerOpen}
                onOpenChange={setCreateDrawerOpen}
            />
        </PageScaffold>
    )
}
