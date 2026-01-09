import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
    AlignmentType,
    ShadingType,
} from 'docx';
import { type LessonPlanResponse } from '@/lib/schemas/lesson-plan';

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

function formatAgeRange(range: string | undefined): string {
    if (!range) return '';
    const r = range.toLowerCase();
    if (r.includes('bebes')) return 'Bebês (zero a 1 ano e 6 meses)';
    if (r.includes('bem-pequenas')) return 'Crianças bem pequenas (1 ano e 7 meses a 3 anos e 11 meses)';
    if (r.includes('pequenas')) return 'Crianças pequenas (4 anos a 5 anos e 11 meses)';
    return range;
}

function formatGrade(gradeSlug: string | undefined): string {
    if (!gradeSlug) return '';
    let grade = gradeSlug.replace(/^ef[12]-/, '');
    grade = grade.replace(/(\d+)[-\s]?ano/i, '$1º ano');
    return grade.charAt(0).toUpperCase() + grade.slice(1);
}

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

// Nomes padrão para etapas sem título
const DEFAULT_STEP_NAMES = [
    'Abertura',
    'Atividade Principal',
    'Sistematização'
];

const DEFAULT_STEP_NAMES_EI = [
    'Acolhimento',
    'Experiência Principal',
    'Registro e Documentação'
];

export async function generateWordDocument(
    plan: LessonPlanResponse,
    bnccSkillDescriptions: {
        code: string;
        description: string;
    }[] = []
): Promise<Buffer> {
    const content = plan.content as any;
    const isEI = plan.educationLevelSlug === 'educacao-infantil';
    const levelDisplay = formatEducationLevel(plan.educationLevelSlug);
    const gradeDisplay = isEI ? formatAgeRange(plan.gradeSlug) : formatGrade(plan.gradeSlug);
    const subjectDisplay = formatSubject(plan.subjectSlug);

    // Identificar habilidades
    const mainSkillCode = content.mainSkillCode || plan.bnccSkillCodes?.[0];
    const complementaryCodes = content.complementarySkillCodes || [];

    // Calcular tempo total
    const totalTime = content.methodology?.reduce((acc: number, step: any) => acc + (step.timeMinutes || 0), 0) || (plan.numberOfClasses * 50);

    // Nomes padrão para etapas
    const stepNames = isEI ? DEFAULT_STEP_NAMES_EI : DEFAULT_STEP_NAMES;

    // Função para buscar descrição com fallback
    const getSkillDescription = (code: string): string => {
        const found = bnccSkillDescriptions.find(s => s.code === code);
        return found?.description || 'Descrição indisponível';
    };

    // Verificar se tem diferenciação com conteúdo real
    const hasDifferentiation = content.differentiation && (
        (content.differentiation.support && content.differentiation.support.length > 0) ||
        (content.differentiation.challenge && content.differentiation.challenge.length > 0) ||
        (content.differentiation.enrichment && content.differentiation.enrichment.length > 0)
    );

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    // ========== CABEÇALHO PRINCIPAL ==========
                    new Paragraph({
                        text: "Plano de Aula",
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 },
                        border: {
                            bottom: { style: BorderStyle.SINGLE, size: 12, color: "333333" },
                        },
                    }),

                    new Paragraph({
                        children: [new TextRun({ text: plan.title, bold: true, size: 26 })],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 300 },
                    }),

                    // ========== BLOCO 1: IDENTIFICAÇÃO ==========
                    new Paragraph({
                        children: [new TextRun({ text: "1. Identificação", bold: true, size: 24 })],
                        shading: { type: ShadingType.SOLID, color: "E0E0E0" },
                        spacing: { before: 200, after: 150 },
                    }),

                    // ---------- 1.1 Dados do Plano (fixo, já preenchido) ----------
                    new Paragraph({
                        children: [new TextRun({ text: "1.1 Dados do Plano", bold: true, size: 20 })],
                        spacing: { before: 100, after: 80 },
                    }),

                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "Etapa:", bold: true })] })],
                                        width: { size: 25, type: WidthType.PERCENTAGE },
                                        shading: { type: ShadingType.SOLID, color: "F5F5F5" },
                                    }),
                                    new TableCell({
                                        children: [new Paragraph(levelDisplay)],
                                        width: { size: 25, type: WidthType.PERCENTAGE },
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: isEI ? "Faixa Etária:" : "Ano/Série:", bold: true })] })],
                                        width: { size: 25, type: WidthType.PERCENTAGE },
                                        shading: { type: ShadingType.SOLID, color: "F5F5F5" },
                                    }),
                                    new TableCell({
                                        children: [new Paragraph(gradeDisplay)],
                                        width: { size: 25, type: WidthType.PERCENTAGE },
                                    }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: isEI ? "Campo de Experiência:" : "Componente Curricular:", bold: true })] })],
                                        shading: { type: ShadingType.SOLID, color: "F5F5F5" },
                                    }),
                                    new TableCell({
                                        children: [new Paragraph(subjectDisplay)],
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "Duração:", bold: true })] })],
                                        shading: { type: ShadingType.SOLID, color: "F5F5F5" },
                                    }),
                                    new TableCell({
                                        children: [new Paragraph(`${plan.numberOfClasses} aula(s) - ${totalTime} min`)],
                                    }),
                                ],
                            }),
                        ],
                    }),

                    // ---------- 1.2 Dados da Escola e Turma (preenchível) ----------
                    new Paragraph({
                        children: [new TextRun({ text: "1.2 Dados da Escola e Turma", bold: true, size: 20 })],
                        spacing: { before: 150, after: 80 },
                    }),

                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "Escola:", bold: true })] })],
                                        width: { size: 15, type: WidthType.PERCENTAGE },
                                        shading: { type: ShadingType.SOLID, color: "F5F5F5" },
                                    }),
                                    new TableCell({
                                        children: [new Paragraph("_______________________________")],
                                        width: { size: 35, type: WidthType.PERCENTAGE },
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "Professor(a):", bold: true })] })],
                                        width: { size: 15, type: WidthType.PERCENTAGE },
                                        shading: { type: ShadingType.SOLID, color: "F5F5F5" },
                                    }),
                                    new TableCell({
                                        children: [new Paragraph("_______________________________")],
                                        width: { size: 35, type: WidthType.PERCENTAGE },
                                    }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "Turma:", bold: true })] })],
                                        shading: { type: ShadingType.SOLID, color: "F5F5F5" },
                                    }),
                                    new TableCell({
                                        children: [new Paragraph("___________")],
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "Data:", bold: true })] })],
                                        shading: { type: ShadingType.SOLID, color: "F5F5F5" },
                                    }),
                                    new TableCell({
                                        children: [new Paragraph("____/____/______")],
                                    }),
                                ],
                            }),
                        ],
                    }),

                    // ========== BLOCO 2: PLANEJAMENTO PEDAGÓGICO ==========
                    new Paragraph({
                        children: [new TextRun({ text: "2. Planejamento Pedagógico", bold: true, size: 24 })],
                        shading: { type: ShadingType.SOLID, color: "E0E0E0" },
                        spacing: { before: 300, after: 150 },
                    }),

                    // Tema / Objeto de Conhecimento
                    new Paragraph({
                        children: [new TextRun({
                            text: isEI ? "Tema Central" : "Objeto de Conhecimento",
                            bold: true,
                            size: 22
                        })],
                        spacing: { before: 150, after: 80 },
                    }),
                    new Paragraph({ text: content.theme || content.knowledgeObject || '', spacing: { after: 150 } }),

                    // Objetivo da Aula
                    new Paragraph({
                        children: [new TextRun({ text: "Objetivo da Aula", bold: true, size: 22 })],
                        spacing: { before: 150, after: 80 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: content.objective || '', bold: true })],
                        spacing: { after: 150 }
                    }),

                    // Critérios de Sucesso
                    new Paragraph({
                        children: [new TextRun({ text: "Critérios de Sucesso", bold: true, size: 22 })],
                        spacing: { before: 150, after: 80 },
                    }),
                    ...(content.successCriteria || []).map((criterion: string) => new Paragraph({
                        text: `• ${criterion}`,
                        spacing: { after: 50 }
                    })),

                    // Habilidades BNCC
                    new Paragraph({
                        children: [new TextRun({
                            text: isEI ? "Objetivos de Aprendizagem (BNCC)" : "Habilidades BNCC",
                            bold: true,
                            size: 22
                        })],
                        spacing: { before: 150, after: 80 },
                    }),

                    // Habilidade Principal
                    ...(mainSkillCode ? [
                        new Paragraph({
                            children: [
                                new TextRun({ text: "PRINCIPAL: ", bold: true }),
                                new TextRun({ text: mainSkillCode, bold: true }),
                            ],
                            spacing: { after: 40 },
                        }),
                        new Paragraph({
                            text: getSkillDescription(mainSkillCode),
                            spacing: { after: 120 },
                        }),
                    ] : []),

                    // Habilidades Complementares
                    ...complementaryCodes.flatMap((code: string) => {
                        return [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: "Complementar: " }),
                                    new TextRun({ text: code, bold: true }),
                                ],
                                spacing: { after: 40 },
                            }),
                            new Paragraph({
                                text: getSkillDescription(code),
                                spacing: { after: 120 },
                            }),
                        ];
                    }),

                    // Direitos de Aprendizagem (EI)
                    ...(isEI && content.rights && content.rights.length > 0 ? [
                        new Paragraph({
                            children: [new TextRun({ text: "Direitos de Aprendizagem", bold: true, size: 22 })],
                            spacing: { before: 150, after: 80 },
                        }),
                        new Paragraph({ text: content.rights.join(', '), spacing: { after: 150 } }),
                    ] : []),

                    // ========== BLOCO 3: METODOLOGIA ==========
                    new Paragraph({
                        children: [new TextRun({ text: "3. Metodologia (Sequência Didática)", bold: true, size: 24 })],
                        shading: { type: ShadingType.SOLID, color: "E0E0E0" },
                        spacing: { before: 300, after: 150 },
                    }),

                    ...(content.methodology || []).flatMap((step: any, i: number) => {
                        const actorLabel = isEI ? "Ações do Adulto:" : "Ações do Professor:";
                        const participantsLabel = isEI ? "Ações das Crianças:" : "Ações dos Alunos:";
                        const actorActions = step.teacherActions || step.adultActions || [];
                        const participantActions = step.studentActions || step.childrenActions || [];

                        const paragraphs = [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: step.stepTitle || stepNames[i] || `Etapa ${i + 1}`, bold: true }),
                                    new TextRun({ text: ` (${step.timeMinutes} min)` }),
                                ],
                                shading: { type: ShadingType.SOLID, color: "F5F5F5" },
                                spacing: { before: 150, after: 80 },
                            }),

                            // Ações do Professor/Adulto
                            ...(actorActions.length > 0 ? [
                                new Paragraph({
                                    children: [new TextRun({ text: actorLabel, bold: true, size: 20 })],
                                    spacing: { after: 40 },
                                }),
                                ...actorActions.map((action: string) =>
                                    new Paragraph({ text: `• ${action}`, spacing: { after: 30 } })
                                ),
                            ] : []),

                            // Ações dos Alunos/Crianças
                            ...(participantActions.length > 0 ? [
                                new Paragraph({
                                    children: [new TextRun({ text: participantsLabel, bold: true, size: 20 })],
                                    spacing: { after: 40 },
                                }),
                                ...participantActions.map((action: string) =>
                                    new Paragraph({ text: `• ${action}`, spacing: { after: 30 } })
                                ),
                            ] : []),
                        ];

                        // Produto/Evidência
                        if (step.expectedOutput) {
                            paragraphs.push(
                                new Paragraph({
                                    children: [
                                        new TextRun({ text: isEI ? "Evidência: " : "Produto Esperado: ", bold: true }),
                                        new TextRun({ text: step.expectedOutput }),
                                    ],
                                    spacing: { after: 40 },
                                })
                            );
                        }

                        // Materiais
                        if (step.materials && step.materials.length > 0) {
                            paragraphs.push(
                                new Paragraph({
                                    children: [
                                        new TextRun({ text: "Materiais: ", bold: true }),
                                        new TextRun({ text: step.materials.join(', ') }),
                                    ],
                                    spacing: { after: 80 },
                                })
                            );
                        }

                        return paragraphs;
                    }),

                    // ========== BLOCO 4: AVALIAÇÃO ==========
                    new Paragraph({
                        children: [new TextRun({ text: "4. Avaliação", bold: true, size: 24 })],
                        shading: { type: ShadingType.SOLID, color: "E0E0E0" },
                        spacing: { before: 300, after: 150 },
                    }),

                    new Paragraph({
                        children: [
                            new TextRun({ text: "Instrumento: ", bold: true }),
                            new TextRun({ text: content.evaluation?.instrument || 'Observação' }),
                        ],
                        spacing: { after: 80 },
                    }),

                    new Paragraph({
                        children: [new TextRun({ text: "Critérios de Avaliação:", bold: true, size: 20 })],
                        spacing: { before: 80, after: 40 },
                    }),
                    ...(content.evaluation?.criteria || []).map((criterion: string) =>
                        new Paragraph({ text: `• ${criterion}`, spacing: { after: 30 } })
                    ),

                    // Dica para o Professor
                    ...(content.notes ? [
                        new Paragraph({
                            children: [new TextRun({ text: "Dica para o Professor", bold: true, size: 22 })],
                            shading: { type: ShadingType.SOLID, color: "FFF3CD" },
                            spacing: { before: 300, after: 80 },
                        }),
                        new Paragraph({ text: content.notes, spacing: { after: 150 } }),
                    ] : []),

                    // ========== BLOCO 5: DIFERENCIAÇÃO (apenas se houver conteúdo) ==========
                    ...(hasDifferentiation ? [
                        new Paragraph({
                            children: [new TextRun({ text: "5. Diferenciação e Inclusão", bold: true, size: 24 })],
                            shading: { type: ShadingType.SOLID, color: "E0E0E0" },
                            spacing: { before: 300, after: 150 },
                        }),
                        new Paragraph({
                            children: [new TextRun({ text: "Apoio / Adaptações:", bold: true, size: 20 })],
                            spacing: { after: 40 },
                        }),
                        ...(content.differentiation?.support || []).map((item: string) =>
                            new Paragraph({ text: `• ${item}`, spacing: { after: 30 } })
                        ),
                        new Paragraph({
                            children: [new TextRun({ text: "Desafios / Enriquecimento:", bold: true, size: 20 })],
                            spacing: { before: 100, after: 40 },
                        }),
                        ...(content.differentiation?.challenge || content.differentiation?.enrichment || []).map((item: string) =>
                            new Paragraph({ text: `• ${item}`, spacing: { after: 30 } })
                        ),
                    ] : []),
                ],
            },
        ],
    });

    return await Packer.toBuffer(doc);
}
