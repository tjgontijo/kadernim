'use client';

import { Plus, Filter, GraduationCap, Sparkles, Zap, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { useSession } from '@/lib/auth/auth-client';
import { UpsellBanner } from '@/components/client/shared/UpsellBanner';
import { CreatePlanDrawer } from '@/components/client/lesson-plans/create-plan-drawer';
import { PlanCard } from '@/components/client/lesson-plans/plan-card';
import { EmptyState } from '@/components/client/lesson-plans/empty-state';
import { useLessonPlans } from '@/hooks/use-lesson-plans';
import { useLessonPlanUsage } from '@/hooks/use-lesson-plan-usage';
import { useEducationLevels, useGrades, useSubjects } from '@/hooks/use-taxonomy';
import { Progress } from '@/components/ui/progress';
import { PageScaffold } from '@/components/client/shared/page-scaffold';
import { SearchInput } from '@/components/client/shared/search-input';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerDescription,
} from "@/components/ui/drawer";
import { useEffect, useState, useMemo } from 'react';
import { type LessonPlanResponse } from '@/lib/schemas/lesson-plan';
import { PageScaffoldSkeleton } from '@/components/client/shared/skeletons/page-scaffold-skeleton';
import { PlanCardSkeleton } from '@/components/client/shared/skeletons/plan-card-skeleton';

export default function LessonPlansPage() {
  const { isMobile } = useBreakpoint();
  const { data: session, isPending: isSessionLoading } = useSession();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Check if user is subscriber
  const userRole = session?.user?.role ?? 'user';
  const isSubscriber = userRole === 'subscriber' || userRole === 'admin';

  useEffect(() => {
    setMounted(true);
  }, []);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // States para a navegação dos filtros
  const [level, setLevel] = useState<string>('all');
  const [grade, setGrade] = useState<string>('all');
  const [subject, setSubject] = useState<string>('all');

  // Fetch taxonomy data usando hooks (cacheado/deduplicado)
  const { data: levels = [] } = useEducationLevels();
  const { data: grades = [] } = useGrades(level);
  const { data: subjects = [] } = useSubjects(level, grade);

  const { data: plans, isLoading } = useLessonPlans();
  const { data: usage, isLoading: isLoadingUsage } = useLessonPlanUsage();

  // Reseta filtros dependentes quando o pai muda
  useEffect(() => {
    if (level === 'all') {
      setGrade('all');
      setSubject('all');
    } else {
      setSubject('all');
    }
  }, [level]);

  // Reseta disciplinas quando o ano muda para garantir validade
  useEffect(() => {
    setSubject('all');
  }, [grade]);

  const filteredPlans = useMemo(() => {
    if (!plans) return [];
    return (plans as LessonPlanResponse[]).filter(plan => {
      // Filtro de Texto (Título)
      const matchesSearch = searchQuery === '' ||
        plan.title.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      const matchLevel = level === 'all' || plan.educationLevelSlug === level;
      const matchGrade = grade === 'all' || plan.gradeSlug === grade;
      const matchSubject = subject === 'all' || plan.subjectSlug === subject;

      return matchLevel && matchGrade && matchSubject;
    });
  }, [plans, searchQuery, level, grade, subject]);

  const isEmpty = !isLoading && (!plans || plans.length === 0);
  const isSearchEmpty = !isLoading && plans && plans.length > 0 && filteredPlans.length === 0;

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (level !== 'all') count++;
    if (grade !== 'all') count++;
    if (subject !== 'all') count++;
    return count;
  }, [level, grade, subject]);

  const clearFilters = () => {
    setLevel('all');
    setGrade('all');
    setSubject('all');
  };

  // Show loading while checking session
  if (isSessionLoading) {
    return (
      <PageScaffoldSkeleton
        CardSkeleton={PlanCardSkeleton}
        cardCount={6}
      />
    )
  }

  // Show paywall for non-subscribers
  if (!isSubscriber) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-6xl mx-auto px-4 py-12 sm:py-20">
          {/* Hero Section */}
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-wider border border-primary/20">
              <Sparkles size={16} className="fill-primary/20" />
              Funcionalidade Premium
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-foreground leading-tight">
              Crie Planos de Aula com <span className="text-primary italic">Inteligência Artificial</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Economize horas de planejamento. Nossa IA cria planos completos, alinhados à BNCC, personalizados para sua turma.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-black text-foreground">Geração Instantânea</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Planos completos em segundos, com objetivos, metodologia, recursos e avaliação.
              </p>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-black text-foreground">Alinhado à BNCC</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Selecione habilidades da Base e receba planos pedagogicamente estruturados.
              </p>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-black text-foreground">Exportação Fácil</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Baixe em PDF ou DOCX e imprima ou edite como preferir.
              </p>
            </div>
          </div>

          {/* Upsell Banner */}
          <UpsellBanner
            title="Acesso Total: De R$347 por R$147 à vista"
            description="ou apenas 12x de R$14,70 no cartão"
            benefits={[
              'Criação ilimitada de planos de aula com IA',
              'Solicitação de recursos exclusivos',
              'Voto em novas funcionalidades da comunidade',
            ]}
            onSubscribe={() => {
              // TODO: Redirect to checkout
              window.location.href = '/checkout';
            }}
          />
        </div>
      </div>
    )
  }

  // Show normal loading for data
  if (isLoading) {
    return (
      <PageScaffoldSkeleton
        CardSkeleton={PlanCardSkeleton}
        cardCount={6}
      />
    )
  }

  return (
    <PageScaffold>
      {/* LINHA 1: Identidade & Ação */}
      <PageScaffold.Header
        title={<>Meus <span className="text-primary italic">Planos</span></>}
        action={
          <Button
            variant="outline"
            onClick={() => setDrawerOpen(true)}
            size="lg"
            className="h-10 sm:h-12 px-4 sm:px-6 rounded-2xl border-primary/20 text-primary hover:bg-primary/5 font-bold transition-all group shrink-0"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 group-hover:rotate-90 transition-transform" />
            Criar Plano
          </Button>
        }
      />

      {/* LINHA 2: Highlight (Uso) */}
      <PageScaffold.Highlight>
        {!isLoadingUsage && usage ? (
          <div className="bg-card border border-border/50 rounded-2xl p-3 sm:py-4 sm:px-6 shadow-sm group relative transition-all hover:shadow-md">
            <div className="flex items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
                  <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/50 leading-none mb-0.5">
                    Meu Uso
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-black text-foreground tabular-nums leading-none">{usage.used}</span>
                    <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tight">de {usage.limit}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 flex-1 max-w-[200px] w-full">
                <Progress value={usage.percentage} className="h-1.5 bg-muted/40" />
                <div className="flex items-center justify-between font-black uppercase tracking-widest text-[8px] text-muted-foreground/30">
                  <span>{usage.percentage}%</span>
                  <span>Renova {usage.resetsAt ? format(new Date(usage.resetsAt), "dd/MM") : '--'}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[74px] bg-card border border-border/50 rounded-2xl animate-pulse" />
        )}
      </PageScaffold.Highlight>


      {/* LINHA 3: Controls (Busca e Filtro) */}
      <PageScaffold.Controls>
        <SearchInput
          placeholder="Buscar nos seus planos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
        />

        {mounted && (
          <Drawer open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-11 sm:h-12 w-11 sm:w-12 rounded-2xl border-border/50 shrink-0 relative"
              >
                <Filter className="h-4 w-4 text-foreground/70" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-black text-primary-foreground shadow-lg shadow-primary/20 ring-2 ring-background">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="rounded-t-[32px] p-6">
              <DrawerHeader>
                <DrawerTitle className="text-2xl font-black text-center">Filtrar Planos</DrawerTitle>
                <DrawerDescription className="sr-only">Ajuste os filtros para organizar seus planos de aula.</DrawerDescription>
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
                    <Select value={subject} onValueChange={setSubject} disabled={level === 'all'}>
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
                    onClick={() => { clearFilters(); setFilterDrawerOpen(false); }}
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

      {/* Conteúdo: Grid de Planos */}
      <section className="px-4 sm:px-0">
        {isEmpty ? (
          <div className="py-16">
            <EmptyState onCreateClick={() => setDrawerOpen(true)} />
          </div>
        ) : isSearchEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Filter className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Nenhum plano encontrado</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2 text-sm text-balance">
              Tente usar outros filtros ou limpe sua seleção de busca.
            </p>
            <Button
              variant="outline"
              onClick={() => { clearFilters(); setSearchQuery(''); }}
              className="mt-6 rounded-2xl px-8 h-12 text-sm font-bold transition-all"
            >
              Limpar tudo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan: any) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </section>

      {/* Wizard Drawer */}
      <CreatePlanDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </PageScaffold>
  );
}
