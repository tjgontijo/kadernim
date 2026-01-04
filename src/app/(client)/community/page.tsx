'use client'

import { useState, useMemo } from 'react'
import { Plus, Sparkles, Filter, X, SlidersHorizontal, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import { VoteProgress } from '@/components/client/community/vote-progress'
import { RequestCard } from '@/components/client/community/request-card'
import { CreateRequestDrawer } from '@/components/client/community/create-request-drawer'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Skeleton } from '@/components/ui/skeleton'
import { useCommunityUsage } from '@/hooks/use-community-usage'
import { triggerConfetti } from '@/lib/utils/confetti'

export default function CommunityPage() {
    const { isMobile, isDesktop } = useBreakpoint()
    const queryClient = useQueryClient()
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
    const [createDrawerOpen, setCreateDrawerOpen] = useState(false)
    const { data: usage, isLoading: isLoadingUsage } = useCommunityUsage()

    // 1. Fetch Requests (Infinite Query)
    const {
        data,
        isLoading,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
    } = useInfiniteQuery({
        queryKey: ['community.requests'],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await fetch(`/api/v1/community/requests?page=${pageParam}&limit=12`)
            if (!res.ok) throw new Error('Erro ao carregar pedidos')
            return res.json()
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { page, totalPages } = lastPage.data
            return page < totalPages ? page + 1 : undefined
        },
    })

    // 2. Voting Mutation
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
            toast.success('Voto computado com sucesso!', {
                icon: '💖',
            })
            triggerConfetti()
            queryClient.invalidateQueries({ queryKey: ['community.requests'] })
            queryClient.invalidateQueries({ queryKey: ['community.usage'] }) // We'll build this next
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const requests = useMemo(() => {
        return data?.pages.flatMap(page => page.data.items) || []
    }, [data])

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 sm:px-0">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs">
                        <Sparkles className="h-4 w-4 fill-current" />
                        Pedidos da Comunidade
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
                        O que você quer que a gente <span className="text-primary italic">produza?</span>
                    </h1>
                    <p className="text-muted-foreground text-sm sm:text-lg font-medium max-w-2xl">
                        Sugerido por professores, validado pela comunidade. Os 10 temas mais votados todos os meses entram em produção oficial.
                    </p>
                </div>

                <Button
                    size="lg"
                    onClick={() => setCreateDrawerOpen(true)}
                    className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all group"
                >
                    <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
                    Sugerir Material
                </Button>
            </header>

            {/* Stats Section */}
            <section className="px-4 sm:px-0">
                {isLoadingUsage ? (
                    <Skeleton className="h-24 w-full rounded-3xl" />
                ) : (
                    <VoteProgress used={usage?.used || 0} total={usage?.limit || 5} />
                )}
            </section>

            {/* Filters Bar */}
            <section className="flex items-center justify-between gap-4 py-2 border-b border-border/40 px-4 sm:px-0">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Votação de Fevereiro</span>
                </div>

                {isMobile ? (
                    <Drawer open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen}>
                        <DrawerTrigger asChild>
                            <Button variant="outline" size="sm" className="rounded-xl font-bold h-10 border-border/50">
                                <Filter className="h-4 w-4 mr-2" />
                                Filtros
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent className="rounded-t-[32px] p-6">
                            <DrawerHeader>
                                <DrawerTitle className="text-2xl font-black">Filtrar Pedidos</DrawerTitle>
                            </DrawerHeader>
                            <div className="py-6 space-y-6">
                                {/* Filter UI here */}
                            </div>
                        </DrawerContent>
                    </Drawer>
                ) : (
                    <div className="flex items-center gap-3">
                        {/* Desktop Filters here */}
                    </div>
                )}
            </section>

            {/* Requests Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 sm:px-0">
                {isLoading ? (
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
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                            <Sparkles className="h-10 w-10 text-muted-foreground opacity-20" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold">Nenhum pedido encontrado</h3>
                            <p className="text-muted-foreground text-sm">Que tal ser a primeira pessoa a sugerir algo este mês?</p>
                        </div>
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
        </div>
    )
}
