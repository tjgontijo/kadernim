export const QA_COMPONENT_CATALOG = `
# CATÁLOGO FECHADO DE COMPONENTES

Você só pode usar component.type com um dos valores abaixo. Qualquer valor fora desta lista é inválido. Não invente tipos.

## 1. Componentes Estruturais
- page_header: Cabeçalho institucional. Deve aparecer EXATAMENTE UMA VEZ no início da lista para servir de template.
- page_footer: Rodapé institucional. Deve aparecer EXATAMENTE UMA VEZ no final da lista para servir de template.
- activity_intro: Orientação geral curta antes de um bloco de questões.

## 2. Componentes de Questão
- multiple_choice: Múltipla escolha com distratores plausíveis.
- true_false: Afirmações para V ou F (foco em compreensão/inferência).
- matching: Associação entre duas colunas.
- fill_blank: Completar lacunas (quando o contexto for suficiente).
- ordering: Ordenação de eventos, processos ou ideias.
- open_short: Resposta aberta curta (2-3 linhas).
- open_long: Resposta desenvolvida (justificativa/argumentação).
- comprehension: Interpretação baseada em dados apresentados no enunciado.
- reasoning: Raciocínio (causa, consequência, inferência).
- creation: Produção prática com critérios claros.

# REGRA GLOBAL
Toda questão deve ser autossuficiente. Se a resposta depende de uma informação (contexto histórico, dados, etc), essa informação DEVE aparecer no enunciado da questão.
`;
