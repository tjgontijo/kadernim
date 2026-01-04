'use client';

import {
    FileDown,
    ArrowLeft,
    Download,
    Calendar,
    Clock,
    School,
    BookOpen,
    Target,
    Lightbulb,
    Wrench,
    ClipboardCheck,
    Eye,
    Package,
    ScrollText,
    Sparkles,
    ListChecks,
    FileText,
    GraduationCap,
    Users,
    Link as LinkIcon,
    SendHorizontal,
    MoreVertical,
    Share2,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { type LessonPlanResponse, type LessonPlanContent } from '@/lib/schemas/lesson-plan';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useDownloadFile } from '@/hooks/use-download-file';

interface PlanViewerProps {
    plan: LessonPlanResponse;
    bnccSkillDescriptions?: {
        code: string;
        description: string;
        fieldOfExperience?: string | null;
        ageRange?: string | null;
    }[];
}

/**
 * Formata o slug de nível educacional para terminologia BNCC
 */
function formatEducationLevel(slug: string): string {
    const mapping: Record<string, string> = {
        'educacao-infantil': 'Educação Infantil',
        'ensino-fundamental-1': 'Ensino Fundamental – Anos Iniciais',
        'ensino-fundamental-2': 'Ensino Fundamental – Anos Finais',
        'ensino-medio': 'Ensino Médio',
    };
    return mapping[slug] || slug.replace(/-/g, ' ');
}

/**
 * Formata a faixa etária para Educação Infantil
 */
function formatAgeRange(range: string | undefined): string {
    if (!range) return '';
    const r = range.toLowerCase();
    if (r.includes('bebes')) return 'Bebês (zero a 1 ano e 6 meses)';
    if (r.includes('bem-pequenas')) return 'Crianças bem pequenas (1 ano e 7 meses a 3 anos e 11 meses)';
    if (r.includes('pequenas')) return 'Crianças pequenas (4 anos a 5 anos e 11 meses)';
    return range;
}

/**
 * Formata o ano escolar para padrão oficial (ex: "3-ano" -> "3º ano")
 */
function formatGrade(gradeSlug: string | undefined): string {
    if (!gradeSlug) return '';
    let grade = gradeSlug.replace(/^ef[12]-/, '');
    grade = grade.replace(/(\d+)[-\s]?ano/i, '$1º ano');
    return grade.charAt(0).toUpperCase() + grade.slice(1);
}

/**
 * Formata componente curricular
 */
function formatSubject(subjectSlug: string | undefined): string {
    if (!subjectSlug) return '';
    const mapping: Record<string, string> = {
        'matematica': 'Matemática',
        'lingua-portuguesa': 'Língua Portuguesa',
        'ciencias': 'Ciências',
        'historia': 'História',
        'geografia': 'Geografia',
        'arte': 'Arte',
        'educacao-fisica': 'Educação Física',
        'lingua-inglesa': 'Língua Inglesa',
        'ensino-religioso': 'Ensino Religioso',
    };
    return mapping[subjectSlug] || subjectSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export function PlanViewer({ plan, bnccSkillDescriptions = [] }: PlanViewerProps) {
    const content = plan.content as unknown as LessonPlanContent;
    const { downloadFile, shareFile, downloading, isMobile, canShare } = useDownloadFile();

    const handleDownload = (format: 'docx' | 'pdf') => {
        const url = `/api/v1/lesson-plans/${plan.id}/export/${format}`;
        const filename = `plano-de-aula-${plan.title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30)}.${format}`;
        downloadFile(url, { filename });
    };

    const handleShare = (format: 'docx' | 'pdf') => {
        const url = `/api/v1/lesson-plans/${plan.id}/export/${format}`;
        const filename = `plano-de-aula-${plan.title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30)}.${format}`;
        shareFile(url, {
            filename,
            title: plan.title,
            text: `Plano de Aula BNCC - ${plan.title}`,
        });
    };

    // Formatar contexto com terminologia BNCC
    const isEI = plan.educationLevelSlug === 'educacao-infantil';
    const levelDisplay = formatEducationLevel(plan.educationLevelSlug);

    // Tenta pegar do plano, se não tiver, pega da primeira habilidade (fallback)
    const gradeDisplay = isEI
        ? formatAgeRange(plan.ageRange || bnccSkillDescriptions[0]?.ageRange || '')
        : formatGrade(plan.gradeSlug);

    const subjectDisplay = isEI
        ? (plan.fieldOfExperience || bnccSkillDescriptions[0]?.fieldOfExperience || '')
        : formatSubject(plan.subjectSlug);

    const BlockHeader = ({ icon: Icon, number, title }: { icon: any, number: number, title: string }) => (
        <div className="flex items-center gap-3 mb-4 sm:mb-6 mt-6 sm:mt-10 first:mt-0">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground font-bold text-base sm:text-lg shrink-0">
                {number}
            </div>
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">{title}</h2>
            </div>
        </div>
    );

    const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
        <div className="flex items-center gap-2 mb-3 sm:mb-4 mt-4 sm:mt-6 first:mt-0">
            <div className="p-1 sm:p-1.5 bg-primary/10 rounded-md">
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold tracking-tight">{title}</h3>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-4 mb-2">
                <Button variant="ghost" size="icon" asChild className="-ml-2 h-10 w-10 rounded-full hover:bg-muted/50">
                    <Link href="/lesson-plans" title="Voltar para Meus Planos">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-full hover:bg-muted/50"
                            disabled={downloading !== null}
                        >
                            {downloading !== null ? (
                                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                            ) : (
                                <SendHorizontal className="h-5 w-5 text-primary rotate-[-45deg] translate-y-[-1px]" />
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-border/50">
                        <DropdownMenuItem
                            onClick={() => handleDownload('pdf')}
                            disabled={downloading !== null}
                            className="cursor-pointer gap-2 py-3 font-medium"
                        >
                            {downloading?.includes('/pdf') ? (
                                <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                            ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                            Visualizar PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleDownload('docx')}
                            disabled={downloading !== null}
                            className="cursor-pointer gap-2 py-3 font-medium"
                        >
                            {downloading?.includes('/docx') ? (
                                <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                            ) : (
                                <Download className="h-4 w-4 text-muted-foreground" />
                            )}
                            Exportar para Word
                        </DropdownMenuItem>

                        {canShare && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => handleShare('pdf')}
                                    disabled={downloading !== null}
                                    className="cursor-pointer gap-2 py-3 font-medium"
                                >
                                    <Share2 className="h-4 w-4 text-muted-foreground" />
                                    Compartilhar PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleShare('docx')}
                                    disabled={downloading !== null}
                                    className="cursor-pointer gap-2 py-3 font-medium"
                                >
                                    <Share2 className="h-4 w-4 text-muted-foreground" />
                                    Compartilhar Word
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Main Content Card */}
            <Card className="border-border/50 shadow-xl overflow-hidden">
                <div className="h-2 bg-primary w-full" />
                <CardHeader className="p-4 sm:p-8 pb-3 sm:pb-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4 items-start">
                        <div className="space-y-1.5">
                            <Badge variant="outline" className="text-primary border-primary/30 uppercase tracking-widest text-[9px] font-bold">
                                Plano de Aula BNCC
                            </Badge>
                            <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight">
                                {plan.title}
                            </CardTitle>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-y-3 gap-x-6 mt-6 text-sm text-muted-foreground font-medium">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary/70" />
                            <span>{format(new Date(plan.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-8 pt-2 sm:pt-4 space-y-4">
                    {/* ========== BLOCO 1: IDENTIFICAÇÃO ========== */}
                    <BlockHeader icon={FileText} number={1} title="Identificação" />

                    <div className="bg-muted/30 rounded-xl border border-border/50 p-4 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Etapa</p>
                                <p className="font-medium">{levelDisplay}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                                    {isEI ? 'Faixa Etária' : 'Ano/Série'}
                                </p>
                                <p className="font-medium">{gradeDisplay}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                                    {isEI ? 'Campo de Experiência' : 'Componente Curricular'}
                                </p>
                                <p className="font-medium">{subjectDisplay}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Duração</p>
                                <p className="font-medium">{plan.numberOfClasses} aula(s) de 50 min</p>
                            </div>
                        </div>
                    </div>

                    {/* ========== BLOCO 2: PLANEJAMENTO PEDAGÓGICO ========== */}
                    <BlockHeader icon={GraduationCap} number={2} title="Planejamento Pedagógico" />

                    {/* Objeto de Conhecimento / Conteúdos */}
                    <SectionHeader icon={BookOpen} title={isEI ? "Conteúdos das experiências" : "Objeto de Conhecimento"} />
                    <p className="text-base sm:text-lg text-foreground/90 leading-relaxed font-medium">
                        {content.knowledgeObject}
                    </p>

                    {/* Habilidades BNCC */}
                    <SectionHeader icon={ListChecks} title={isEI ? "Objetivos de Aprendizagem e Desenvolvimento (BNCC)" : "Habilidades da BNCC"} />
                    <div className="space-y-3">
                        {plan.bnccSkillCodes.map(code => {
                            const skillDesc = bnccSkillDescriptions.find(s => s.code === code);
                            return (
                                <div key={code} className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                                    <Badge variant="secondary" className="px-3 py-1 text-sm font-bold border-primary/20 bg-primary/10 text-primary mb-2">
                                        {code}
                                    </Badge>
                                    {skillDesc && (
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {skillDesc.description}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Objetivos de Aprendizagem */}
                    <SectionHeader icon={Target} title="Objetivos de Aprendizagem" />
                    <ul className="space-y-3">
                        {content.objectives.map((obj, i) => (
                            <li key={i} className="flex gap-3 leading-relaxed">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                                    {i + 1}
                                </span>
                                {obj}
                            </li>
                        ))}
                    </ul>

                    {/* Competências / Direitos de Aprendizagem */}
                    <SectionHeader icon={Lightbulb} title={isEI ? "Direitos de Aprendizagem e Desenvolvimento" : "Competências"} />
                    <ul className="space-y-2">
                        {content.competencies.map((comp, i) => (
                            <li key={i} className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg border border-border/50 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                                {comp}
                            </li>
                        ))}
                    </ul>

                    {/* ========== BLOCO 3: EXECUÇÃO E ACOMPANHAMENTO ========== */}
                    <BlockHeader icon={Users} number={3} title="Execução e Acompanhamento" />

                    {/* Metodologia */}
                    <SectionHeader icon={ScrollText} title="Metodologia (Sequência Didática)" />
                    <div className="space-y-5 sm:space-y-6 relative ml-2 sm:ml-3 border-l-2 border-primary/10 pl-5 sm:pl-8 py-2">
                        {content.methodology.map((m, i) => {
                            // Remove números iniciais (ex: "1.", "1)", "1 - ", ou apenas "1")
                            const cleanText = (text: string) => text.replace(/^\d+([\.\)\-\s]+\s*|\s+|$)/, '').trim();

                            const stepTitle = cleanText(m.step || '');
                            const stepDescription = cleanText(m.description || '');

                            return (
                                <div key={i} className="relative">
                                    <div className="absolute -left-[29px] sm:-left-[41px] top-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary border-4 border-background flex items-center justify-center text-white text-[10px] sm:text-xs font-bold shadow-sm">
                                        {i + 1}
                                    </div>
                                    <div className="pt-1">
                                        <p className="text-muted-foreground leading-relaxed text-sm">
                                            {stepTitle && (
                                                <span className="font-bold text-primary mr-2 uppercase tracking-tight">
                                                    {stepTitle}
                                                    {stepDescription ? ' –' : ''}
                                                </span>
                                            )}
                                            {stepDescription}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Recursos Didáticos */}
                    <SectionHeader icon={Package} title="Recursos Didáticos" />
                    <div className="flex flex-wrap gap-2">
                        {content.resources.map((res, i) => (
                            <Badge key={i} variant="outline" className="rounded-md px-3 py-1 font-normal bg-muted/20">
                                {res}
                            </Badge>
                        ))}
                    </div>

                    {/* Avaliação */}
                    <SectionHeader icon={ClipboardCheck} title="Avaliação" />
                    <div className="bg-muted/30 p-6 rounded-xl border border-border/50 text-muted-foreground whitespace-pre-wrap">
                        {(() => {
                            const evalText = content.evaluation || '';
                            // Se o texto contém lista com "-" ou ";"
                            if (evalText.includes('-') || evalText.includes(';')) {
                                // Tenta separar o prefixo "Considerando:" do resto da lista
                                const parts = evalText.split(/[:\n]/);
                                const intro = parts[0].includes('considerando') ? parts[0] + ':' : '';

                                // Extrai os itens (removendo o prefixo se existir)
                                const listItems = evalText
                                    .replace(intro, '')
                                    .split(/[-;•\n]/)
                                    .map(item => item.trim())
                                    .filter(item => item.length > 0);

                                if (listItems.length > 1) {
                                    return (
                                        <div className="space-y-3">
                                            {intro && <p className="mb-2 font-medium text-foreground/80">{intro}</p>}
                                            <ul className="space-y-2">
                                                {listItems.map((item, idx) => (
                                                    <li key={idx} className="flex gap-2">
                                                        <span className="text-primary">•</span>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                }
                            }
                            return evalText;
                        })()}
                    </div>

                    {/* Adequações e Inclusão */}
                    <SectionHeader icon={Sparkles} title="Adequações e Inclusão" />
                    <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 text-foreground/90">
                        {content.adaptations}
                    </div>

                    {/* Referências */}
                    <SectionHeader icon={LinkIcon} title="Referências" />
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        {content.references.map((ref, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                {ref}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

        </div>
    );
}
