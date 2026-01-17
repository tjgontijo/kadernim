'use client';

import {
    ArrowLeft,
    Download,
    Calendar,
    BookOpen,
    Target,
    Lightbulb,
    ClipboardCheck,
    Eye,
    ListChecks,
    FileText,
    GraduationCap,
    Users,
    SendHorizontal,
    Share2,
    Loader2,
    Star,
    CheckCircle2,
    Timer,
    Copy,
    ExternalLink
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
import { type LessonPlanResponse } from '@/lib/schemas/lesson-plan';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useDownloadFile } from '@/hooks/utils/use-download-file';

interface PlanViewerProps {
    plan: LessonPlanResponse;
    bnccSkillDescriptions?: {
        code: string;
        description: string;
    }[];
}

function formatEducationLevel(slug: string): string {
    const mapping: Record<string, string> = {
        'educacao-infantil': 'Educação Infantil',
        'ensino-fundamental-1': 'Ensino Fundamental – Anos Iniciais',
        'ensino-fundamental-2': 'Ensino Fundamental – Anos Finais',
        'ensino-medio': 'Ensino Médio',
    };
    return mapping[slug] || slug.replace(/-/g, ' ');
}

function formatGrade(gradeSlug: string | undefined): string {
    if (!gradeSlug) return '';
    let grade = gradeSlug.replace(/^ef[12]-/, '');
    grade = grade.replace(/(\d+)[-\s]?ano/i, '$1º ano');
    return grade.charAt(0).toUpperCase() + grade.slice(1);
}

/**
 * Gera Markdown do plano de aula (para colar no Google Docs)
 */
function generatePlanMarkdown(
    plan: LessonPlanResponse,
    content: any,
    bnccSkillDescriptions: { code: string; description: string }[]
): string {
    const isEI = plan.educationLevelSlug === 'educacao-infantil';
    const mainSkillCode = content.mainSkillCode || plan.bnccSkillCodes?.[0];
    const mainSkillDesc = bnccSkillDescriptions.find(s => s.code === mainSkillCode)?.description || '';

    let md = `# ${plan.title}\n\n`;
    md += `## Contexto\n`;
    md += `- **Etapa:** ${formatEducationLevel(plan.educationLevelSlug)}\n`;
    md += `- **Ano/Série:** ${formatGrade(plan.gradeSlug)}\n`;
    md += `- **Componente:** ${plan.subjectSlug?.replace(/-/g, ' ')}\n`;
    md += `- **Duração:** ${plan.numberOfClasses} aula(s)\n\n`;

    md += `## Objetivo\n${content.objective || ''}\n\n`;

    md += `## ${isEI ? 'Tema Central' : 'Objeto de Conhecimento'}\n`;
    md += `${content.theme || content.knowledgeObject || ''}\n\n`;

    md += `## Habilidade Principal\n`;
    md += `**${mainSkillCode}**: ${mainSkillDesc}\n\n`;

    if (content.successCriteria?.length) {
        md += `## Critérios de Sucesso\n`;
        content.successCriteria.forEach((c: string) => { md += `- ${c}\n`; });
        md += '\n';
    }

    md += `## Metodologia\n`;
    (content.methodology || []).forEach((step: any, i: number) => {
        md += `### ${i + 1}. ${step.stepTitle} (${step.timeMinutes} min)\n`;
        const actorLabel = isEI ? 'Adulto' : 'Professor';
        const participantsLabel = isEI ? 'Crianças' : 'Alunos';
        const actorActions = step.teacherActions || step.adultActions || [];
        const participantActions = step.studentActions || step.childrenActions || [];

        if (actorActions.length) {
            md += `**${actorLabel}:**\n`;
            actorActions.forEach((a: string) => { md += `- ${a}\n`; });
        }
        if (participantActions.length) {
            md += `**${participantsLabel}:**\n`;
            participantActions.forEach((a: string) => { md += `- ${a}\n`; });
        }
        if (step.expectedOutput) {
            md += `**Produto:** ${step.expectedOutput}\n`;
        }
        if (step.materials?.length) {
            md += `**Materiais:** ${step.materials.join(', ')}\n`;
        }
        md += '\n';
    });

    if (content.evaluation) {
        md += `## Avaliação\n`;
        md += `**Instrumento:** ${content.evaluation.instrument || ''}\n`;
        if (content.evaluation.criteria?.length) {
            md += `**Critérios:**\n`;
            content.evaluation.criteria.forEach((c: string) => { md += `- ${c}\n`; });
        }
        md += '\n';
    }

    if (content.notes) {
        md += `## 💡 Dica de Ouro\n${content.notes}\n`;
    }

    return md;
}

export function PlanViewer({ plan, bnccSkillDescriptions = [] }: PlanViewerProps) {
    const content = plan.content as any; // Cast para any para flexibilidade no MVP
    const { downloadFile, shareFile, downloading, canShare, isMobile } = useDownloadFile();

    const handleDownload = (format: 'docx' | 'pdf') => {
        const url = `/api/v1/lesson-plans/${plan.id}/export/${format}`;
        const filename = `plano-de-aula-${plan.title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30)}.${format}`;
        downloadFile(url, { filename });
    };

    const handleOpenPdf = () => {
        // Abre PDF em nova aba para visualização (desktop)
        window.open(`/api/v1/lesson-plans/${plan.id}/export/pdf`, '_blank');
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

    const handleCopyMarkdown = async () => {
        try {
            const md = generatePlanMarkdown(plan, content, bnccSkillDescriptions);
            await navigator.clipboard.writeText(md);
            // Toast de sucesso (usando o hook)
            if (typeof window !== 'undefined') {
                const { toast } = await import('sonner');
                toast.success('Markdown copiado! Cole no Google Docs (Inserir > Markdown)');
            }
        } catch (error) {
            console.error('Erro ao copiar:', error);
        }
    };

    const isEI = plan.educationLevelSlug === 'educacao-infantil';
    const levelDisplay = formatEducationLevel(plan.educationLevelSlug);
    const gradeDisplay = isEI ? plan.gradeSlug : formatGrade(plan.gradeSlug);
    const subjectDisplay = plan.subjectSlug?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const mainSkillCode = content.mainSkillCode || content.focus?.mainSkillCode || content.focus?.mainObjectiveCode || plan.bnccSkillCodes?.[0];
    const complementaryCodes = content.complementarySkillCodes || content.focus?.complementarySkillCodes || content.focus?.complementaryObjectiveCodes || [];
    const totalTime = content.methodology?.reduce((acc: number, step: any) => acc + (step.timeMinutes || 0), 0) || (plan.numberOfClasses * 50);

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
            <div className="flex items-center justify-between gap-4 mb-2">
                <Button variant="ghost" size="icon" asChild className="-ml-2 h-10 w-10 rounded-full hover:bg-muted/50">
                    <Link href="/lesson-plans" title="Voltar">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-primary/10" disabled={downloading !== null}>
                            {downloading !== null ? (
                                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                            ) : (
                                <Download className="h-5 w-5 text-primary" />
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl">
                        {/* MOBILE: Compartilhar via Web Share API */}
                        {isMobile && canShare && (
                            <>
                                <DropdownMenuItem onClick={() => handleShare('pdf')} className="cursor-pointer gap-2 py-3 font-medium">
                                    <Share2 className="h-4 w-4" /> Compartilhar PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleShare('docx')} className="cursor-pointer gap-2 py-3 font-medium">
                                    <Share2 className="h-4 w-4" /> Compartilhar Word
                                </DropdownMenuItem>
                            </>
                        )}

                        {/* DESKTOP: Visualizar PDF + Downloads */}
                        {!isMobile && (
                            <>
                                <DropdownMenuItem onClick={handleOpenPdf} className="cursor-pointer gap-2 py-3 font-medium">
                                    <ExternalLink className="h-4 w-4" /> Visualizar PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownload('docx')} className="cursor-pointer gap-2 py-3 font-medium">
                                    <Download className="h-4 w-4" /> Baixar Word (.docx)
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleCopyMarkdown} className="cursor-pointer gap-2 py-3 font-medium">
                                    <Copy className="h-4 w-4" /> Copiar Markdown
                                </DropdownMenuItem>
                            </>
                        )}

                        {/* Fallback MOBILE sem Web Share API */}
                        {isMobile && !canShare && (
                            <>
                                <DropdownMenuItem onClick={() => handleDownload('pdf')} className="cursor-pointer gap-2 py-3 font-medium">
                                    <Download className="h-4 w-4" /> Baixar PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownload('docx')} className="cursor-pointer gap-2 py-3 font-medium">
                                    <Download className="h-4 w-4" /> Baixar Word (.docx)
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Card className="border-border/50 shadow-xl overflow-hidden">
                <div className="h-2 bg-primary w-full" />
                <CardHeader className="p-4 sm:p-8">
                    <div className="space-y-1.5">
                        <Badge variant="outline" className="text-primary border-primary/30 uppercase tracking-widest text-[9px] font-bold">
                            Plano de Aula BNCC
                        </Badge>
                        <CardTitle className="text-2xl sm:text-3xl font-extrabold leading-tight">
                            {plan.title}
                        </CardTitle>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-6 text-sm text-muted-foreground font-medium">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary/70" />
                            <span>{format(new Date(plan.createdAt), "dd/MM/yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Timer className="h-4 w-4 text-primary/70" />
                            <span>{totalTime} min</span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-8 space-y-6">
                    <BlockHeader icon={FileText} number={1} title="Contexto" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-xl">
                        <div><p className="text-[10px] uppercase text-muted-foreground">Etapa</p><p className="font-bold text-sm">{levelDisplay}</p></div>
                        <div><p className="text-[10px] uppercase text-muted-foreground">Ano</p><p className="font-bold text-sm">{gradeDisplay}</p></div>
                        <div><p className="text-[10px] uppercase text-muted-foreground">Componente</p><p className="font-bold text-sm">{subjectDisplay}</p></div>
                        <div><p className="text-[10px] uppercase text-muted-foreground">Tempo</p><p className="font-bold text-sm">{totalTime} min</p></div>
                    </div>

                    <SectionHeader icon={BookOpen} title={isEI ? "Tema Central" : "Objeto de Conhecimento"} />
                    <p className="text-lg font-semibold">{content.theme || content.knowledgeObject}</p>

                    <SectionHeader icon={Target} title="Objetivo da Aula" />
                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                        <p className="font-medium">{content.objective}</p>
                    </div>

                    <SectionHeader icon={ListChecks} title="Habilidades BNCC" />
                    <div className="space-y-3">
                        <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-4">
                            <Badge className="mb-2">{mainSkillCode}</Badge>
                            <p className="text-sm text-muted-foreground">{bnccSkillDescriptions.find(s => s.code === mainSkillCode)?.description}</p>
                        </div>
                        {complementaryCodes.map((code: string) => (
                            <div key={code} className="bg-muted/30 p-3 rounded-lg flex items-center gap-3">
                                <Badge variant="outline">{code}</Badge>
                                <span className="text-xs text-muted-foreground truncate">{bnccSkillDescriptions.find(s => s.code === code)?.description}</span>
                            </div>
                        ))}
                    </div>

                    <BlockHeader icon={Users} number={2} title="Metodologia (3 Etapas)" />
                    <div className="space-y-4">
                        {content.methodology?.map((step: any, i: number) => {
                            const actorLabel = isEI ? 'Adulto' : 'Professor';
                            const participantsLabel = isEI ? 'Crianças' : 'Alunos';
                            const actorActions = step.teacherActions || step.adultActions || [];
                            const participantActions = step.studentActions || step.childrenActions || [];

                            return (
                                <div key={i} className="bg-muted/20 rounded-xl border border-border/50 overflow-hidden">
                                    <div className="p-4 bg-muted/40 border-b border-border/30 flex justify-between">
                                        <span className="font-bold text-sm uppercase tracking-wide">{step.stepTitle}</span>
                                        <Badge variant="outline">{step.timeMinutes} min</Badge>
                                    </div>
                                    <div className="p-4 grid md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">{actorLabel}</p>
                                            <ul className="text-sm space-y-1">{actorActions.map((a: string, j: number) => <li key={j}>• {a}</li>)}</ul>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">{participantsLabel}</p>
                                            <ul className="text-sm space-y-1">{participantActions.map((a: string, j: number) => <li key={j}>• {a}</li>)}</ul>
                                        </div>
                                    </div>
                                    {step.expectedOutput && (
                                        <div className="px-4 pb-2">
                                            <p className="text-[10px] font-bold uppercase text-primary/70 mb-1">Produto/Evidência</p>
                                            <p className="text-sm text-muted-foreground">{step.expectedOutput}</p>
                                        </div>
                                    )}
                                    {step.materials?.length > 0 && (
                                        <div className="px-4 pb-4">
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Materiais</p>
                                            <div className="flex flex-wrap gap-1">{step.materials.map((m: string, j: number) => <Badge key={j} variant="outline" className="text-[9px]">{m}</Badge>)}</div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <BlockHeader icon={ClipboardCheck} number={3} title="Avaliação" />
                    <div className="bg-muted/30 p-6 rounded-xl space-y-4">
                        <p className="font-bold text-primary">{content.evaluation?.instrument}</p>
                        <ul className="space-y-1">{content.evaluation?.criteria?.map((c: string, i: number) => <li key={i} className="text-sm flex gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> {c}</li>)}</ul>
                    </div>

                    {content.notes && (
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900 text-sm">
                            <span className="font-bold">💡 Dica de ouro:</span> {content.notes}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
