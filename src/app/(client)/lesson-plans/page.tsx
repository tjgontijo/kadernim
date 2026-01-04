'use client';

import { Plus, GraduationCap, Search, CalendarClock, Filter, X, Sparkles, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { CreatePlanDrawer } from '@/components/client/lesson-plans/create-plan-drawer';
import { PlanCard } from '@/components/client/lesson-plans/plan-card';
import { EmptyState } from '@/components/client/lesson-plans/empty-state';
import { useLessonPlans } from '@/hooks/use-lesson-plans';
import { useLessonPlanUsage } from '@/hooks/use-lesson-plan-usage';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/client/shared/page-header';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState, useMemo } from 'react';
import { type LessonPlanResponse } from '@/lib/schemas/lesson-plan';

interface FilterOption {
  slug: string;
  name: string;
}

export default function LessonPlansPage() {
  const { isMobile } = useBreakpoint();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // States para os filtros cascateados
  const [level, setLevel] = useState<string>('all');
  const [grade, setGrade] = useState<string>('all');
  const [subject, setSubject] = useState<string>('all');

  // Opções para os dropdowns
  const [levels, setLevels] = useState<FilterOption[]>([]);
  const [grades, setGrades] = useState<FilterOption[]>([]);
  const [subjects, setSubjects] = useState<FilterOption[]>([]);

  const { data: plans, isLoading } = useLessonPlans();
  const { data: usage, isLoading: isLoadingUsage } = useLessonPlanUsage();

  // Carregar Etapas ao montar
  useEffect(() => {
    fetch('/api/v1/education-levels')
      .then(res => res.json())
      .then(data => { if (data.success) setLevels(data.data); });
  }, []);

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

    // Resetar dependentes
    setGrade('all');
    setSubject('all');
  }, [level]);

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

    // Resetar dependente
    setSubject('all');
  }, [grade, level]);

  const filteredPlans = useMemo(() => {
    if (!plans) return [];
    return (plans as LessonPlanResponse[]).filter(plan => {
      const matchLevel = level === 'all' || plan.educationLevelSlug === level;

      const matchGrade = grade === 'all' ||
        (plan.educationLevelSlug === 'educacao-infantil' ? plan.ageRange === grade : plan.gradeSlug === grade);

      const matchSubject = subject === 'all' ||
        (plan.educationLevelSlug === 'educacao-infantil' ? plan.fieldOfExperience === subject : plan.subjectSlug === subject);

      return matchLevel && matchGrade && matchSubject;
    });
  }, [plans, level, grade, subject]);

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

  const renderFilters = (isInsideDrawer = false) => (
    <div className={isInsideDrawer ? "flex flex-col gap-6 p-2" : "flex flex-wrap items-center gap-3"}>
      {!isInsideDrawer && (
        <div className="flex items-center gap-2 pr-3 text-muted-foreground border-r border-border/50 mr-1">
          <Filter className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Filtros</span>
        </div>
      )}

      {isInsideDrawer && (
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-[-12px]">Etapa de Ensino</label>
      )}
      <Select value={level} onValueChange={setLevel}>
        <SelectTrigger className={isInsideDrawer ? "h-14 w-full bg-muted/30 border-border/50 rounded-2xl text-sm font-bold" : "h-11 w-[190px] bg-background border-border/50 rounded-2xl text-xs font-semibold focus:ring-primary/20 transition-all shadow-sm"}>
          <SelectValue placeholder="Todas as Etapas" />
        </SelectTrigger>
        <SelectContent className="rounded-2xl shadow-xl border-border/50">
          <SelectItem value="all">Todas as Etapas</SelectItem>
          {levels.map(l => <SelectItem key={l.slug} value={l.slug}>{l.name}</SelectItem>)}
        </SelectContent>
      </Select>

      {isInsideDrawer && (
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-[-12px]">Ano / Série</label>
      )}
      <Select value={grade} onValueChange={setGrade} disabled={level === 'all'}>
        <SelectTrigger className={isInsideDrawer ? "h-14 w-full bg-muted/30 border-border/50 rounded-2xl text-sm font-bold" : "h-11 w-[190px] bg-background border-border/50 rounded-2xl text-xs font-semibold focus:ring-primary/20 transition-all shadow-sm"}>
          <SelectValue placeholder={level === 'educacao-infantil' ? 'Faixa Etária' : 'Ano/Série'} />
        </SelectTrigger>
        <SelectContent className="rounded-2xl shadow-xl border-border/50">
          <SelectItem value="all">Todos os Anos</SelectItem>
          {grades.map(g => <SelectItem key={g.slug} value={g.slug}>{g.name}</SelectItem>)}
        </SelectContent>
      </Select>

      {isInsideDrawer && (
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-[-12px]">Componente / Campo</label>
      )}
      <Select value={subject} onValueChange={setSubject} disabled={grade === 'all' && level !== 'educacao-infantil'}>
        <SelectTrigger className={isInsideDrawer ? "h-14 w-full bg-muted/30 border-border/50 rounded-2xl text-sm font-bold" : "h-11 w-[240px] bg-background border-border/50 rounded-2xl text-xs font-semibold focus:ring-primary/20 transition-all shadow-sm"}>
          <SelectValue placeholder={level === 'educacao-infantil' ? 'Campo de Exp.' : 'Componente'} />
        </SelectTrigger>
        <SelectContent className="rounded-2xl shadow-xl border-border/50">
          <SelectItem value="all">Todos os Componentes</SelectItem>
          {subjects.map(s => <SelectItem key={s.slug} value={s.slug}>{s.name}</SelectItem>)}
        </SelectContent>
      </Select>

      {(level !== 'all' || grade !== 'all' || subject !== 'all') && (
        <Button
          variant={isInsideDrawer ? "secondary" : "ghost"}
          size="sm"
          onClick={() => {
            clearFilters();
            if (isInsideDrawer) setFilterDrawerOpen(false);
          }}
          className={isInsideDrawer ? "h-14 w-full rounded-2xl gap-2 font-bold mt-2" : "h-11 px-4 gap-2 text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-2xl transition-all"}
        >
          <X className="h-4 w-4" />
          Limpar Filtros
        </Button>
      )}

      {isInsideDrawer && (
        <Button
          className="h-14 w-full rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg mt-4"
          onClick={() => setFilterDrawerOpen(false)}
        >
          Ver Resultados
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Padronized Header */}
      <PageHeader
        icon={GraduationCap}
        title={<>Meus <span className="text-primary italic">Planos</span></>}
        action={
          <Button
            onClick={() => setDrawerOpen(true)}
            size="lg"
            className="h-11 sm:h-14 px-6 sm:px-8 rounded-2xl bg-primary text-primary-foreground font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all group"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 group-hover:rotate-90 transition-transform" />
            Criar Plano
          </Button>
        }
      />

      {/* Toolbar Section - Responsive Layout */}
      <div className="mb-6 max-w-7xl mx-auto w-full px-3 sm:px-0">
        {mounted && (
          <>
            {!isMobile ? (
              /* Desktop Toolbar Card */
              <div className="bg-muted/10 p-5 rounded-[24px] border border-border/50 backdrop-blur-sm">
                <div className="flex flex-col xl:flex-row gap-5 xl:items-center">
                  {renderFilters()}

                  <div className="hidden xl:block h-8 w-[1px] bg-border/50 mx-2" />

                  {!isLoadingUsage && usage ? (
                    <div className="flex items-center gap-8 justify-between flex-1">
                      <div className="flex flex-col gap-2 flex-1 max-w-[220px]">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <span>Uso Mensal</span>
                          <span className="text-primary">{usage.used} <span className="text-muted-foreground/50 mx-0.5">/</span> {usage.limit}</span>
                        </div>
                        <Progress value={usage.percentage} className="h-1.5 bg-background shadow-inner" />
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary border border-primary/10 shadow-sm">
                            <CalendarClock className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1.5">Renovação</span>
                            <span className="text-xs font-extrabold text-foreground leading-none">
                              {usage.resetsAt ? format(new Date(usage.resetsAt), "dd 'de' MMM", { locale: ptBR }) : '--'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Desktop Usage Skeleton */
                    <div className="flex items-center gap-8 justify-between flex-1 animate-pulse">
                      <div className="flex flex-col gap-2 flex-1 max-w-[220px]">
                        <Skeleton className="h-2 w-24 mb-1" />
                        <Skeleton className="h-1.5 w-full rounded-full" />
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-xl" />
                        <div className="flex flex-col gap-1.5">
                          <Skeleton className="h-2 w-16" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Mobile Toolbar - Ultra Minimalist & Clean */
              <div className="flex items-center justify-between px-1 min-h-[40px]">
                {/* Usage Info - Minimalist Row */}
                {!isLoadingUsage && usage ? (
                  <div className="flex items-center gap-4 text-[11px] font-medium text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="relative h-1.5 w-10 bg-muted/40 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-primary/70 rounded-full"
                          style={{ width: `${usage.percentage}%` }}
                        />
                      </div>
                      <span className="font-bold text-foreground">
                        {usage.used}<span className="text-muted-foreground/50 font-medium">/{usage.limit}</span>
                      </span>
                    </div>

                    <div className="h-3 w-[1px] bg-border/50" />

                    <div className="flex items-center gap-1.5">
                      <CalendarClock size={13} className="text-muted-foreground/60" />
                      <span>{usage.resetsAt ? format(new Date(usage.resetsAt), "dd/MM") : '--'}</span>
                    </div>
                  </div>
                ) : (
                  /* Mobile Usage Skeleton */
                  <div className="flex items-center gap-3 animate-pulse">
                    <Skeleton className="h-1.5 w-10 rounded-full" />
                    <Skeleton className="h-3 w-8" />
                    <div className="h-3 w-[1px] bg-border/30" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                )}

                {/* Filter - Ultra Discrete */}
                <Drawer open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen}>
                  <DrawerTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <SlidersHorizontal size={18} />
                      {activeFiltersCount > 0 && (
                        <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="rounded-t-[24px]">
                    <DrawerHeader className="pb-4">
                      <DrawerTitle className="text-base font-bold text-center">Filtrar Biblioteca</DrawerTitle>
                      <DrawerDescription className="sr-only">Ajuste os filtros para organizar seus planos de aula.</DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 pb-8">
                      {renderFilters(true)}
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>
            )}
          </>
        )}
      </div>

      {/* Content Section - Plans Grid */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-0 pb-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse bg-card border border-border/50 rounded-2xl p-6 h-48 flex flex-col justify-between">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4 rounded-md" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-20 rounded-md" />
                    <Skeleton className="h-4 w-16 rounded-md" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-12 rounded-full" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <div className="py-16">
            <EmptyState onCreateClick={() => setDrawerOpen(true)} />
          </div>
        ) : isSearchEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Filter className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Nenhum plano encontrado</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2 text-sm">
              Tente usar outros filtros ou limpe sua seleção.
            </p>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="mt-6 rounded-xl px-6 h-11 text-sm font-bold transition-all"
            >
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredPlans.map((plan: any) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </div>

      {/* Wizard Drawer */}
      <CreatePlanDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}
