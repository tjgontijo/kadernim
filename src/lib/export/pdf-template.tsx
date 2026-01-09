import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    renderToBuffer
} from '@react-pdf/renderer';
import { type LessonPlanResponse, type LessonPlanContent } from '@/lib/schemas/lesson-plan';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        paddingBottom: 60, // Espaço para rodapé
        fontSize: 10.5, // Aumentado de 10 para melhor leitura
        fontFamily: 'Helvetica',
        lineHeight: 1.5,
    },
    mainHeader: {
        fontSize: 14,
        marginBottom: 12,
        textAlign: 'center',
        fontWeight: 'bold',
        borderBottomWidth: 2,
        borderBottomColor: '#333',
        paddingBottom: 6,
    },
    lessonTitle: {
        fontSize: 12,
        marginBottom: 12,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    blockHeader: {
        fontSize: 11,
        fontWeight: 'bold',
        backgroundColor: '#e0e0e0',
        padding: 5,
        marginTop: 14, // Mais espaço entre blocos
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 4,
        color: '#333',
    },
    table: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    tableRowLast: {
        flexDirection: 'row',
    },
    tableColLabel: {
        width: '30%',
        padding: 5,
        backgroundColor: '#f5f5f5',
        fontWeight: 'bold',
        fontSize: 9,
    },
    tableColValue: {
        width: '70%',
        padding: 5,
        fontSize: 9,
    },
    // Tabela simplificada com 4 colunas
    tableCompact: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
    },
    tableCompactRow: {
        flexDirection: 'row',
    },
    tableCompactCell: {
        flex: 1,
        padding: 5,
        borderRightWidth: 1,
        borderRightColor: '#ccc',
        fontSize: 8,
    },
    tableCompactCellLast: {
        flex: 1,
        padding: 5,
        fontSize: 8,
    },
    tableCompactLabel: {
        fontWeight: 'bold',
        fontSize: 7,
        color: '#666',
        marginBottom: 2,
    },
    paragraph: {
        marginBottom: 6,
        textAlign: 'justify',
    },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 2, // Reduzido de 3 para menos espaço entre itens
    },
    bullet: {
        width: 12,
    },
    bulletText: {
        flex: 1,
    },
    methodStep: {
        marginBottom: 10,
        padding: 8,
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 2,
    },
    stepHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    stepTitle: {
        fontWeight: 'bold',
        fontSize: 10,
    },
    stepTime: {
        fontSize: 9,
        color: '#666',
        backgroundColor: '#e0e0e0',
        padding: 2,
        paddingLeft: 6,
        paddingRight: 6,
        borderRadius: 2,
    },
    actionLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#555',
        marginTop: 4,
        marginBottom: 2,
    },
    // Mini card para Objeto de Conhecimento / Tema Central
    highlightCard: {
        backgroundColor: '#f0f7ff',
        borderWidth: 1,
        borderColor: '#c0d8f0',
        padding: 8,
        marginBottom: 8,
        borderRadius: 2,
    },
    highlightLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#4a6fa3',
        marginBottom: 3,
    },
    highlightText: {
        fontSize: 10,
        color: '#333',
    },
    skillCard: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 8,
        marginBottom: 6,
        borderRadius: 2,
    },
    skillCardMain: {
        backgroundColor: '#e8f4e8',
        borderWidth: 2,
        borderColor: '#4a7c4a',
        padding: 8,
        marginBottom: 6,
        borderRadius: 2,
    },
    skillCode: {
        fontWeight: 'bold',
        fontSize: 10,
        marginBottom: 3,
    },
    skillCodeMain: {
        fontWeight: 'bold',
        fontSize: 11,
        marginBottom: 3,
        color: '#2d5a2d',
    },
    skillDescription: {
        fontSize: 9,
        color: '#444',
    },
    skillDescriptionFallback: {
        fontSize: 9,
        color: '#888',
        fontStyle: 'italic',
    },
    mainBadge: {
        fontSize: 7,
        backgroundColor: '#4a7c4a',
        color: 'white',
        padding: 2,
        paddingLeft: 4,
        paddingRight: 4,
        borderRadius: 2,
        marginLeft: 6,
    },
    evalSection: {
        marginBottom: 8,
    },
    evalType: {
        fontSize: 9,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    diffSection: {
        flexDirection: 'row',
        marginTop: 4,
    },
    diffColumn: {
        flex: 1,
        marginRight: 8,
    },
    diffLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 3,
    },
    // Rodapé fixo
    footer: {
        position: 'absolute',
        bottom: 25,
        left: 40,
        right: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 8,
        color: '#999',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 8,
    },
});

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

interface Props {
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

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

export const LessonPlanPDF = ({ plan, bnccSkillDescriptions = [] }: Props) => {
    if (!plan || !plan.content) return null;
    const content = plan.content as any;

    const isEI = plan.educationLevelSlug === 'educacao-infantil';
    const levelDisplay = formatEducationLevel(plan.educationLevelSlug);
    const gradeDisplay = isEI ? formatAgeRange(plan.gradeSlug) : formatGrade(plan.gradeSlug);
    const subjectDisplay = formatSubject(plan.subjectSlug);

    // Identificar habilidade principal
    const mainSkillCode = content.mainSkillCode || plan.bnccSkillCodes?.[0];
    const complementaryCodes = content.complementarySkillCodes || [];

    // Calcular tempo total
    const totalTime = content.methodology?.reduce((acc: number, step: any) => acc + (step.timeMinutes || 0), 0) || (plan.numberOfClasses * 50);

    // Verificar se tem diferenciação com conteúdo real
    const hasDifferentiation = content.differentiation && (
        (content.differentiation.support && content.differentiation.support.length > 0) ||
        (content.differentiation.challenge && content.differentiation.challenge.length > 0) ||
        (content.differentiation.enrichment && content.differentiation.enrichment.length > 0)
    );

    // Nomes padrão para etapas
    const stepNames = isEI ? DEFAULT_STEP_NAMES_EI : DEFAULT_STEP_NAMES;

    // Função para buscar descrição com fallback
    const getSkillDescription = (code: string): string | null => {
        const found = bnccSkillDescriptions.find(s => s.code === code);
        if (found) return found.description;
        return null;
    };

    return (
        <Document title={plan.title || 'Plano de Aula'}>
            <Page size="A4" style={styles.page}>
                {/* ========== CABEÇALHO ========== */}
                <Text style={styles.mainHeader}>Plano de Aula</Text>
                <Text style={styles.lessonTitle}>{plan.title}</Text>

                {/* ========== BLOCO 1: IDENTIFICAÇÃO ========== */}
                <Text style={styles.blockHeader}>1. Identificação</Text>

                {/* 1.1 Dados do Plano (fixo, já preenchido) */}
                <Text style={styles.sectionTitle}>1.1 Dados do Plano</Text>

                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={styles.tableColLabel}><Text>Etapa:</Text></View>
                        <View style={{ ...styles.tableColValue, width: '20%' }}><Text>{levelDisplay}</Text></View>
                        <View style={styles.tableColLabel}><Text>{isEI ? 'Faixa Etária:' : 'Ano/Série:'}</Text></View>
                        <View style={{ ...styles.tableColValue, width: '20%' }}><Text>{gradeDisplay}</Text></View>
                    </View>
                    <View style={styles.tableRowLast}>
                        <View style={styles.tableColLabel}><Text>{isEI ? 'Campo de Experiência:' : 'Componente Curricular:'}</Text></View>
                        <View style={{ ...styles.tableColValue, width: '20%' }}><Text>{subjectDisplay}</Text></View>
                        <View style={styles.tableColLabel}><Text>Duração:</Text></View>
                        <View style={{ ...styles.tableColValue, width: '20%' }}><Text>{plan.numberOfClasses || 1} aula(s) - {totalTime} min</Text></View>
                    </View>
                </View>

                {/* 1.2 Dados da Escola e Turma (texto simples, sem campos preenchíveis) */}
                <Text style={styles.sectionTitle}>1.2 Dados da Escola e Turma</Text>

                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={styles.tableColLabel}><Text>Escola:</Text></View>
                        <View style={{ ...styles.tableColValue, width: '20%' }}><Text>(preencher)</Text></View>
                        <View style={styles.tableColLabel}><Text>Professor(a):</Text></View>
                        <View style={{ ...styles.tableColValue, width: '20%' }}><Text>(preencher)</Text></View>
                    </View>
                    <View style={styles.tableRowLast}>
                        <View style={styles.tableColLabel}><Text>Turma:</Text></View>
                        <View style={{ ...styles.tableColValue, width: '20%' }}><Text>(preencher)</Text></View>
                        <View style={styles.tableColLabel}><Text>Data:</Text></View>
                        <View style={{ ...styles.tableColValue, width: '20%' }}><Text>(preencher)</Text></View>
                    </View>
                </View>

                {/* ========== BLOCO 2: PLANEJAMENTO PEDAGÓGICO ========== */}
                <Text style={styles.blockHeader}>2. Planejamento Pedagógico</Text>

                {/* Objeto de Conhecimento / Tema - Mini Card Visual */}
                {(content.knowledgeObject || content.theme) && (
                    <View style={styles.highlightCard}>
                        <Text style={styles.highlightLabel}>
                            {isEI ? 'TEMA CENTRAL' : 'OBJETO DE CONHECIMENTO'}
                        </Text>
                        <Text style={styles.highlightText}>
                            {content.knowledgeObject || content.theme}
                        </Text>
                    </View>
                )}

                {/* Objetivo da Aula (único, observável) */}
                <Text style={styles.sectionTitle}>Objetivo da Aula</Text>
                <Text style={{ ...styles.paragraph, fontWeight: 'bold' }}>{content.objective || ''}</Text>

                {/* Critérios de Sucesso */}
                {content.successCriteria && content.successCriteria.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Critérios de Sucesso</Text>
                        {content.successCriteria.map((criterion: string, i: number) => (
                            <View key={i} style={styles.bulletPoint}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>{criterion}</Text>
                            </View>
                        ))}
                    </>
                )}

                {/* Habilidades BNCC - Principal destacada */}
                <Text style={styles.sectionTitle}>
                    {isEI ? 'Objetivos de Aprendizagem (BNCC)' : 'Habilidades BNCC'}
                </Text>

                {/* Habilidade Principal */}
                {mainSkillCode && (
                    <View style={styles.skillCardMain}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.skillCodeMain}>{mainSkillCode}</Text>
                            <Text style={styles.mainBadge}>PRINCIPAL</Text>
                        </View>
                        {(() => {
                            const desc = getSkillDescription(mainSkillCode);
                            return desc
                                ? <Text style={styles.skillDescription}>{desc}</Text>
                                : <Text style={styles.skillDescriptionFallback}>Descrição indisponível</Text>;
                        })()}
                    </View>
                )}

                {/* Habilidades Complementares */}
                {complementaryCodes.map((code: string) => {
                    const desc = getSkillDescription(code);
                    return (
                        <View key={code} style={styles.skillCard}>
                            <Text style={styles.skillCode}>{code} (Complementar)</Text>
                            {desc
                                ? <Text style={styles.skillDescription}>{desc}</Text>
                                : <Text style={styles.skillDescriptionFallback}>Descrição indisponível</Text>
                            }
                        </View>
                    );
                })}

                {/* Direitos de Aprendizagem (EI) */}
                {isEI && content.rights && content.rights.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Direitos de Aprendizagem</Text>
                        <Text style={styles.paragraph}>{content.rights.join(', ')}</Text>
                    </>
                )}

                {/* ========== BLOCO 3: EXECUÇÃO ========== */}
                <Text style={styles.blockHeader}>3. Metodologia (Sequência Didática)</Text>

                {content.methodology && content.methodology.map((step: any, i: number) => (
                    <View key={i} style={styles.methodStep}>
                        <View style={styles.stepHeader}>
                            <Text style={styles.stepTitle}>
                                {step.stepTitle || stepNames[i] || `Etapa ${i + 1}`}
                            </Text>
                            {step.timeMinutes && <Text style={styles.stepTime}>{step.timeMinutes} min</Text>}
                        </View>

                        {/* Ações do Professor/Adulto */}
                        {((step.teacherActions && step.teacherActions.length > 0) ||
                            (step.adultActions && step.adultActions.length > 0)) && (
                                <>
                                    <Text style={styles.actionLabel}>{isEI ? 'Ações do Adulto' : 'Ações do Professor'}</Text>
                                    {(step.teacherActions || step.adultActions || []).map((action: string, j: number) => (
                                        <View key={j} style={styles.bulletPoint}>
                                            <Text style={styles.bullet}>•</Text>
                                            <Text style={styles.bulletText}>{action}</Text>
                                        </View>
                                    ))}
                                </>
                            )}

                        {/* Ações dos Alunos/Crianças */}
                        {((step.studentActions && step.studentActions.length > 0) ||
                            (step.childrenActions && step.childrenActions.length > 0)) && (
                                <>
                                    <Text style={styles.actionLabel}>{isEI ? 'Ações das Crianças' : 'Ações dos Alunos'}</Text>
                                    {(step.studentActions || step.childrenActions || []).map((action: string, j: number) => (
                                        <View key={j} style={styles.bulletPoint}>
                                            <Text style={styles.bullet}>•</Text>
                                            <Text style={styles.bulletText}>{action}</Text>
                                        </View>
                                    ))}
                                </>
                            )}

                        {/* Produto/Evidência */}
                        {step.expectedOutput && (
                            <>
                                <Text style={styles.actionLabel}>{isEI ? 'Evidência' : 'Produto Esperado'}</Text>
                                <Text style={styles.paragraph}>{step.expectedOutput}</Text>
                            </>
                        )}

                        {/* Materiais */}
                        {step.materials && step.materials.length > 0 && (
                            <>
                                <Text style={styles.actionLabel}>Materiais</Text>
                                <Text style={styles.paragraph}>{step.materials.join(', ')}</Text>
                            </>
                        )}
                    </View>
                ))}

                {/* ========== BLOCO 4: AVALIAÇÃO ========== */}
                <Text style={styles.blockHeader}>4. Avaliação</Text>

                {content.evaluation && (
                    <View style={styles.evalSection}>
                        {content.evaluation.instrument && (
                            <Text style={styles.paragraph}>{content.evaluation.instrument}</Text>
                        )}

                        {/* Critérios de avaliação */}
                        {content.evaluation.criteria && content.evaluation.criteria.length > 0 && (
                            <>
                                <Text style={{ ...styles.actionLabel, marginTop: 6 }}>Critérios</Text>
                                {content.evaluation.criteria.map((criterion: string, i: number) => (
                                    <View key={i} style={styles.bulletPoint}>
                                        <Text style={styles.bullet}>•</Text>
                                        <Text style={styles.bulletText}>{criterion}</Text>
                                    </View>
                                ))}
                            </>
                        )}
                    </View>
                )}

                {/* Notas do Professor */}
                {content.notes && (
                    <>
                        <Text style={styles.sectionTitle}>Dica para o Professor</Text>
                        <Text style={styles.paragraph}>{content.notes}</Text>
                    </>
                )}

                {/* ========== BLOCO 5: DIFERENCIAÇÃO (Apenas se houver conteúdo) ========== */}
                {hasDifferentiation && (
                    <>
                        <Text style={styles.blockHeader}>5. Diferenciação e Inclusão</Text>
                        <View style={styles.diffSection}>
                            <View style={styles.diffColumn}>
                                <Text style={styles.diffLabel}>Apoio / Adaptações</Text>
                                {(content.differentiation?.support || []).map((item: string, i: number) => (
                                    <View key={i} style={styles.bulletPoint}>
                                        <Text style={styles.bullet}>•</Text>
                                        <Text style={styles.bulletText}>{item}</Text>
                                    </View>
                                ))}
                            </View>
                            <View style={styles.diffColumn}>
                                <Text style={styles.diffLabel}>Desafios / Enriquecimento</Text>
                                {(content.differentiation?.challenge || content.differentiation?.enrichment || []).map((item: string, i: number) => (
                                    <View key={i} style={styles.bulletPoint}>
                                        <Text style={styles.bullet}>•</Text>
                                        <Text style={styles.bulletText}>{item}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </>
                )}

                {/* ========== RODAPÉ COM PAGINAÇÃO ========== */}
                <View style={styles.footer} fixed>
                    <Text>Gerado em {formatDate(new Date())}</Text>
                    <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
                </View>
            </Page>
        </Document>
    );
};

export async function generatePDFBuffer(
    plan: LessonPlanResponse,
    bnccSkillDescriptions?: { code: string; description: string }[]
): Promise<Buffer> {
    try {
        return await renderToBuffer(
            <LessonPlanPDF plan={plan} bnccSkillDescriptions={bnccSkillDescriptions} />
        );
    } catch (error) {
        console.error('[PDF Template] Error rendering to buffer:', error);
        throw error;
    }
}
