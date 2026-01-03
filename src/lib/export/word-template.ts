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
import { type LessonPlanResponse, type LessonPlanContent } from '@/lib/schemas/lesson-plan';

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
 * Formata o ano escolar para padrão oficial (ex: "3 ano" -> "3º ano")
 */
function formatGrade(gradeSlug: string | undefined): string {
    if (!gradeSlug) return '';

    // Remove prefixos como "ef1-" ou "ef2-"
    let grade = gradeSlug.replace(/^ef[12]-/, '');

    // Substitui patterns como "3-ano" ou "3 ano" por "3º ano"
    grade = grade.replace(/(\d+)[-\s]?ano/i, '$1º ano');

    // Capitaliza primeira letra
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

export async function generateWordDocument(
    plan: LessonPlanResponse,
    bnccSkillDescriptions: {
        code: string;
        description: string;
        fieldOfExperience?: string | null;
        ageRange?: string | null;
    }[] = []
): Promise<Buffer> {
    const content = plan.content as unknown as LessonPlanContent;

    // Formatar contexto
    const isEI = plan.educationLevelSlug === 'educacao-infantil';
    const levelDisplay = formatEducationLevel(plan.educationLevelSlug);

    // Fallbacks para campos que podem estar vazios no plano mas existem nas skills
    const gradeDisplay = isEI
        ? formatAgeRange(plan.ageRange || bnccSkillDescriptions[0]?.ageRange || '')
        : formatGrade(plan.gradeSlug);

    const subjectDisplay = isEI
        ? (plan.fieldOfExperience || bnccSkillDescriptions[0]?.fieldOfExperience || '')
        : formatSubject(plan.subjectSlug);

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    // ========== CABEÇALHO PRINCIPAL ==========
                    new Paragraph({
                        text: "PLANO DE AULA",
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 },
                        border: {
                            bottom: { style: BorderStyle.SINGLE, size: 12, color: "333333" },
                        },
                    }),

                    // Título da Aula
                    new Paragraph({
                        children: [new TextRun({ text: plan.title, bold: true, size: 26 })],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 300 },
                    }),

                    // ========== BLOCO 1: IDENTIFICAÇÃO ==========
                    new Paragraph({
                        children: [new TextRun({ text: "1. IDENTIFICAÇÃO", bold: true, size: 24 })],
                        shading: { type: ShadingType.SOLID, color: "E0E0E0" },
                        spacing: { before: 200, after: 150 },
                    }),

                    // Campos preenchíveis
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Escola: ", bold: true }),
                            new TextRun({ text: "_______________________________________________" }),
                        ],
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Professor(a): ", bold: true }),
                            new TextRun({ text: "___________________________________________" }),
                        ],
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Turma: ", bold: true }),
                            new TextRun({ text: "____________" }),
                            new TextRun({ text: "          " }),
                            new TextRun({ text: "Data: ", bold: true }),
                            new TextRun({ text: "____/____/______" }),
                        ],
                        spacing: { after: 150 },
                    }),

                    // Tabela de identificação
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "Etapa:", bold: true })] })],
                                        width: { size: 30, type: WidthType.PERCENTAGE },
                                        shading: { type: ShadingType.SOLID, color: "F5F5F5" },
                                    }),
                                    new TableCell({
                                        children: [new Paragraph(levelDisplay)],
                                        width: { size: 70, type: WidthType.PERCENTAGE },
                                    }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: isEI ? "Faixa Etária:" : "Ano/Série:", bold: true })] })],
                                        shading: { type: ShadingType.SOLID, color: "F5F5F5" },
                                    }),
                                    new TableCell({
                                        children: [new Paragraph(gradeDisplay)],
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
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: "Duração:", bold: true })] })],
                                        shading: { type: ShadingType.SOLID, color: "F5F5F5" },
                                    }),
                                    new TableCell({
                                        children: [new Paragraph(`${plan.numberOfClasses} aula(s) de 50 minutos`)],
                                    }),
                                ],
                            }),
                        ],
                    }),

                    // ========== BLOCO 2: PLANEJAMENTO PEDAGÓGICO ==========
                    new Paragraph({
                        children: [new TextRun({ text: "2. PLANEJAMENTO PEDAGÓGICO", bold: true, size: 24 })],
                        shading: { type: ShadingType.SOLID, color: "E0E0E0" },
                        spacing: { before: 300, after: 150 },
                    }),

                    // Objeto de Conhecimento / Conteúdos
                    new Paragraph({
                        children: [new TextRun({
                            text: isEI ? "Conteúdos das experiências" : "Objeto de Conhecimento",
                            bold: true,
                            size: 22
                        })],
                        spacing: { before: 150, after: 80 },
                    }),
                    new Paragraph({ text: content.knowledgeObject || '', spacing: { after: 150 } }),

                    // Habilidades BNCC - título condicional
                    new Paragraph({
                        children: [new TextRun({
                            text: isEI ? "Objetivos de Aprendizagem e Desenvolvimento (BNCC)" : "Habilidades da BNCC",
                            bold: true,
                            size: 22
                        })],
                        spacing: { before: 150, after: 80 },
                    }),
                    ...(plan.bnccSkillCodes || []).flatMap(code => {
                        const skillDesc = bnccSkillDescriptions.find(s => s.code === code);
                        return [
                            new Paragraph({
                                children: [new TextRun({ text: code, bold: true })],
                                spacing: { after: 40 },
                            }),
                            ...(skillDesc ? [new Paragraph({
                                text: skillDesc.description,
                                spacing: { after: 120 },
                            })] : []),
                        ];
                    }),

                    // Objetivos de Aprendizagem - primeiro em destaque
                    new Paragraph({
                        children: [new TextRun({ text: "Objetivos de Aprendizagem", bold: true, size: 22 })],
                        spacing: { before: 150, after: 80 },
                    }),
                    ...(content.objectives || []).map((obj, i) => new Paragraph({
                        children: [new TextRun({ text: `• ${obj}`, bold: i === 0 })],
                        spacing: { after: 50 }
                    })),

                    // Competências / Direitos
                    new Paragraph({
                        children: [new TextRun({
                            text: isEI ? "Direitos de Aprendizagem e Desenvolvimento" : "Competências",
                            bold: true,
                            size: 22
                        })],
                        spacing: { before: 150, after: 80 },
                    }),
                    ...(content.competencies || []).map(comp => new Paragraph({ text: `• ${comp}`, spacing: { after: 50 } })),

                    // ========== BLOCO 3: EXECUÇÃO E ACOMPANHAMENTO ==========
                    new Paragraph({
                        children: [new TextRun({ text: "3. EXECUÇÃO E ACOMPANHAMENTO", bold: true, size: 24 })],
                        shading: { type: ShadingType.SOLID, color: "E0E0E0" },
                        spacing: { before: 300, after: 150 },
                    }),

                    // Metodologia - limpeza de numeração duplicada
                    new Paragraph({
                        children: [new TextRun({ text: "Metodologia (Sequência Didática)", bold: true, size: 22 })],
                        spacing: { before: 150, after: 80 },
                    }),
                    ...(content.methodology || []).map((m, i) => {
                        const cleanText = (text: string) => (text || '').replace(/^\d+([\.\)\-\s]+\s*|\s+|$)/, '').trim();
                        const sTitle = cleanText(m.step);
                        const sDesc = cleanText(m.description);

                        return new Paragraph({
                            children: [
                                new TextRun({ text: `${i + 1}. `, bold: true }),
                                ...(sTitle ? [new TextRun({ text: sTitle, bold: true }), new TextRun({ text: " – " })] : []),
                                new TextRun(sDesc),
                            ],
                            spacing: { after: 80 },
                        });
                    }),

                    // Recursos Didáticos
                    new Paragraph({
                        children: [new TextRun({ text: "Recursos Didáticos", bold: true, size: 22 })],
                        spacing: { before: 150, after: 80 },
                    }),
                    ...(content.resources || []).map(res => new Paragraph({ text: `• ${res}`, spacing: { after: 50 } })),

                    // Avaliação
                    new Paragraph({
                        children: [new TextRun({ text: "Avaliação", bold: true, size: 22 })],
                        spacing: { before: 150, after: 80 },
                    }),
                    ...(() => {
                        const evalText = content.evaluation || '';
                        if (evalText.includes('-') || evalText.includes(';')) {
                            const parts = evalText.split(/[:\n]/);
                            const intro = parts[0].includes('considerando') ? parts[0] + ':' : '';

                            const listItems = evalText
                                .replace(intro, '')
                                .split(/[-;•\n]/)
                                .map(item => item.trim())
                                .filter(item => item.length > 0);

                            if (listItems.length > 1) {
                                return [
                                    ...(intro ? [new Paragraph({
                                        children: [new TextRun({ text: intro, bold: true })],
                                        spacing: { after: 100 },
                                    })] : []),
                                    ...listItems.map(item => new Paragraph({
                                        text: `• ${item}`,
                                        spacing: { after: 50 },
                                    })),
                                    new Paragraph({ text: '', spacing: { after: 100 } }),
                                ];
                            }
                        }
                        return [new Paragraph({ text: evalText, spacing: { after: 150 } })];
                    })(),

                    // Adequações e Inclusão
                    new Paragraph({
                        children: [new TextRun({ text: "Adequações e Inclusão", bold: true, size: 22 })],
                        spacing: { before: 150, after: 80 },
                    }),
                    new Paragraph({ text: content.adaptations || '', spacing: { after: 150 } }),

                    // Referências
                    new Paragraph({
                        children: [new TextRun({ text: "Referências", bold: true, size: 22 })],
                        spacing: { before: 150, after: 80 },
                    }),
                    ...(content.references || []).map(ref => new Paragraph({ text: `• ${ref}`, spacing: { after: 50 } })),

                    // Rodapé removido para uso profissional do professor
                ],
            },
        ],
    });

    return await Packer.toBuffer(doc);
}
