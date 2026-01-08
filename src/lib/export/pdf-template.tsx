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
        fontSize: 10,
        fontFamily: 'Helvetica',
        lineHeight: 1.4,
    },
    // Cabeçalho principal
    mainHeader: {
        fontSize: 16,
        marginBottom: 15,
        textAlign: 'center',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        borderBottomWidth: 2,
        borderBottomColor: '#333',
        paddingBottom: 8,
    },
    // Título da aula
    lessonTitle: {
        fontSize: 13,
        marginBottom: 15,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    // Blocos visuais
    blockHeader: {
        fontSize: 11,
        fontWeight: 'bold',
        backgroundColor: '#e0e0e0',
        padding: 6,
        marginTop: 12,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    // Seções dentro de blocos
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 4,
        textTransform: 'uppercase',
        color: '#333',
    },
    // Tabela de identificação
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
    // Campos para preenchimento
    fillableField: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    fieldLabel: {
        fontWeight: 'bold',
        fontSize: 9,
    },
    fieldLine: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#999',
        marginLeft: 5,
    },
    // Conteúdo
    paragraph: {
        marginBottom: 6,
        textAlign: 'justify',
    },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    bullet: {
        width: 12,
    },
    bulletText: {
        flex: 1,
    },
    bulletTextBold: {
        flex: 1,
        fontWeight: 'bold',
    },
    methodStep: {
        marginBottom: 6,
    },
    stepNumber: {
        fontWeight: 'bold',
    },
    // Skill card
    skillCard: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 8,
        marginBottom: 6,
        borderRadius: 2,
    },
    skillCode: {
        fontWeight: 'bold',
        fontSize: 10,
        marginBottom: 3,
    },
    skillDescription: {
        fontSize: 9,
        color: '#444',
    },
});

interface Props {
    plan: LessonPlanResponse;
    bnccSkillDescriptions?: {
        code: string;
        description: string;
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

export const LessonPlanPDF = ({ plan, bnccSkillDescriptions = [] }: Props) => {
    if (!plan || !plan.content) return null;
    const content = plan.content as unknown as LessonPlanContent;

    // Formatar contexto
    const isEI = plan.educationLevelSlug === 'educacao-infantil';
    const levelDisplay = formatEducationLevel(plan.educationLevelSlug);

    let gradeDisplay = isEI
        ? formatAgeRange(plan.gradeSlug)
        : formatGrade(plan.gradeSlug);

    let subjectDisplay = isEI
        ? formatSubject(plan.subjectSlug)
        : formatSubject(plan.subjectSlug);

    return (
        <Document title={plan.title || 'Plano de Aula'}>
            <Page size="A4" style={styles.page}>
                {/* ========== CABEÇALHO ========== */}
                <Text style={styles.mainHeader}>Plano de Aula</Text>
                <Text style={styles.lessonTitle}>{plan.title}</Text>

                {/* ========== BLOCO 1: IDENTIFICAÇÃO ========== */}
                <Text style={styles.blockHeader}>1. Identificação</Text>

                {/* Campos preenchíveis (escola, professor, data) */}
                <View style={styles.fillableField}>
                    <Text style={styles.fieldLabel}>Escola:</Text>
                    <View style={styles.fieldLine} />
                </View>
                <View style={styles.fillableField}>
                    <Text style={styles.fieldLabel}>Professor(a):</Text>
                    <View style={styles.fieldLine} />
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                    <View style={{ ...styles.fillableField, flex: 1, marginRight: 10, marginBottom: 0 }}>
                        <Text style={styles.fieldLabel}>Turma:</Text>
                        <View style={styles.fieldLine} />
                    </View>
                    <View style={{ ...styles.fillableField, flex: 1, marginBottom: 0 }}>
                        <Text style={styles.fieldLabel}>Data:</Text>
                        <View style={styles.fieldLine} />
                    </View>
                </View>

                {/* Informações fixas */}
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={styles.tableColLabel}><Text>Etapa:</Text></View>
                        <View style={styles.tableColValue}><Text>{levelDisplay}</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={styles.tableColLabel}><Text>{isEI ? 'Faixa Etária:' : 'Ano/Série:'}</Text></View>
                        <View style={styles.tableColValue}><Text>{gradeDisplay}</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={styles.tableColLabel}><Text>{isEI ? 'Campo de Experiência:' : 'Componente Curricular:'}</Text></View>
                        <View style={styles.tableColValue}><Text>{subjectDisplay}</Text></View>
                    </View>
                    <View style={styles.tableRowLast}>
                        <View style={styles.tableColLabel}><Text>Duração:</Text></View>
                        <View style={styles.tableColValue}><Text>{plan.numberOfClasses || 1} aula(s) de 50 minutos</Text></View>
                    </View>
                </View>

                {/* ========== BLOCO 2: PLANEJAMENTO PEDAGÓGICO ========== */}
                <Text style={styles.blockHeader}>2. Planejamento Pedagógico</Text>

                {/* Objeto de Conhecimento / Conteúdos */}
                <Text style={styles.sectionTitle}>
                    {isEI ? 'Conteúdos das experiências' : 'Objeto de Conhecimento'}
                </Text>
                <Text style={styles.paragraph}>{content.knowledgeObject || ''}</Text>

                {/* Habilidades BNCC */}
                <Text style={styles.sectionTitle}>
                    {isEI ? 'Objetivos de Aprendizagem e Desenvolvimento (BNCC)' : 'Habilidades da BNCC'}
                </Text>
                {(plan.bnccSkillCodes || []).map((code) => {
                    const skillDesc = bnccSkillDescriptions.find(s => s.code === code);
                    return (
                        <View key={code} style={styles.skillCard}>
                            <Text style={styles.skillCode}>{code}</Text>
                            {skillDesc && (
                                <Text style={styles.skillDescription}>{skillDesc.description}</Text>
                            )}
                        </View>
                    );
                })}

                {/* Objetivos de Aprendizagem - primeiro em destaque */}
                <Text style={styles.sectionTitle}>Objetivos de Aprendizagem</Text>
                {(content.objectives || []).map((obj, i) => (
                    <View key={i} style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={i === 0 ? styles.bulletTextBold : styles.bulletText}>{obj}</Text>
                    </View>
                ))}

                {/* Competências / Direitos de Aprendizagem */}
                <Text style={styles.sectionTitle}>
                    {isEI ? 'Direitos de Aprendizagem e Desenvolvimento' : 'Competências'}
                </Text>
                {(content.competencies || []).map((comp, i) => (
                    <View key={i} style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{comp}</Text>
                    </View>
                ))}

                {/* ========== BLOCO 3: EXECUÇÃO E ACOMPANHAMENTO ========== */}
                <Text style={styles.blockHeader}>3. Execução e Acompanhamento</Text>

                {/* Metodologia - limpeza de numeração duplicada */}
                <Text style={styles.sectionTitle}>Metodologia (Sequência Didática)</Text>
                {(content.methodology || []).map((m, i) => {
                    const cleanText = (text: string) => (text || '').replace(/^\d+([\.\)\-\s]+\s*|\s+|$)/, '').trim();
                    const sTitle = cleanText(m.step);
                    const sDesc = cleanText(m.description);

                    return (
                        <View key={i} style={styles.methodStep}>
                            <Text>
                                <Text style={styles.stepNumber}>{i + 1}. </Text>
                                {sTitle && sDesc
                                    ? <Text><Text style={{ fontWeight: 'bold' }}>{sTitle} – </Text>{sDesc}</Text>
                                    : (sTitle || sDesc || '')}
                            </Text>
                        </View>
                    );
                })}

                {/* Recursos Didáticos */}
                <Text style={styles.sectionTitle}>Recursos Didáticos</Text>
                {(content.resources || []).map((res, i) => (
                    <View key={i} style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{res}</Text>
                    </View>
                ))}

                {/* Avaliação */}
                <Text style={styles.sectionTitle}>Avaliação</Text>
                {(() => {
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
                            return (
                                <View style={{ marginBottom: 10 }}>
                                    {intro ? <Text style={{ ...styles.paragraph, fontWeight: 'bold', marginBottom: 4 }}>{intro}</Text> : null}
                                    {listItems.map((item, idx) => (
                                        <View key={idx} style={styles.bulletPoint}>
                                            <Text style={styles.bullet}>•</Text>
                                            <Text style={styles.bulletText}>{item}</Text>
                                        </View>
                                    ))}
                                </View>
                            );
                        }
                    }
                    return <Text style={styles.paragraph}>{evalText}</Text>;
                })()}

                {/* Adequações e Inclusão */}
                <Text style={styles.sectionTitle}>Adequações e Inclusão</Text>
                <Text style={styles.paragraph}>{content.adaptations || ''}</Text>

                {/* Referências */}
                <Text style={styles.sectionTitle}>Referências</Text>
                {(content.references || []).map((ref, i) => (
                    <View key={i} style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{ref}</Text>
                    </View>
                ))}

                {/* Rodapé removido para uso profissional do professor */}
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
