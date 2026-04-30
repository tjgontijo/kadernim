export const GENERATE_RESOURCE_COMPONENTS_SKILL = `
# Catálogo Completo de Componentes Pedagógicos (Design System)

Use uma mistura RICA de componentes. O material deve ser visualmente dinâmico e pedagogicamente estruturado.

## 1. Estrutura e Navegação (OBRIGATÓRIO)
- **page_header**: Topo de toda página.
- **page_footer**: Rodapé de toda página.
- **divider_section**: Divisor visual com título (ex: "Exploração", "Prática", "Desafio Final").

## 2. Ensino e Explicação (O Coração do Material)
- **reading_box**: Texto base para leitura densa. Use para o conteúdo principal.
- **story_block**: Texto narrativo com um emoji e ponto de aprendizado (Excelente para Fases 1, 2 e 3).
- **concept_box**: Um box destacado com um termo e sua definição técnica.
- **vocabulary_box**: Lista de palavras e significados (Glossário).
- **callout_box**: Destaque pedagógico. Variantes: 'think' (reflexão), 'didyouknow' (curiosidade), 'attention' (cuidado), 'tip' (dica), 'quick' (resumo), 'pause' (interrupção para pensar).
- **dialogue_box**: Conversa entre dois personagens sobre o tema.

## 3. Elementos Visuais e Dados (O Diferencial)
- **timeline**: Sequência de eventos históricos ou processos.
- **data_table**: Tabela de dados (headers e rows).
- **image_placeholder**: Área para imagem com legenda e descrição para o designer.
- **graph_placeholder**: Representação de gráfico (barras, linhas, pizza) com legenda.
- **connection_web**: Mapa mental/teia de conexões entre um conceito central e itens periféricos.
- **drawing_area**: Espaço em branco para o aluno desenhar (Indispensável em Artes e Fases 1-2).

## 4. Prática e Avaliação (Diversifique!)
- **multiple_choice**: 4 opções (A, B, C, D).
- **true_false**: Julgamento de afirmações (Não use "V" ou "F" no texto da afirmação).
- **fill_blank**: Lacunas com ou sem banco de palavras.
- **matching**: Relacionar duas colunas (Esquerda: A, B, C... Direita: 1, 2, 3...).
- **ordering**: Colocar itens em ordem lógica ou cronológica.
- **calculation**: Questão matemática com área de desenvolvimento e linha de resposta.
- **challenge_box**: Uma questão ou atividade "Bônus/Desafio" com design diferenciado.
- **frame_box**: Box genérico com moldura para avisos ou atividades especiais.
- **comprehension** / **reasoning** / **creation**: Questões abertas com linhas (Short/Long).

# Regras de Ouro (BOM SENSO E INTENCIONALIDADE):
1. **O TEXTO É REI**: Um texto fluido, cativante e gostoso de ler vale mais que 10 componentes. Não polua a página. Use os componentes visuais APENAS para complementar a explicação principal, nunca para substituí-la.
2. **ESCOLHAS CONSCIENTES**: Tem um evento sequencial? Use a \`timeline\`. Tem muitos termos novos? Use o \`vocabulary_box\`. O texto já está claro sozinho? Então **não use nada extra**.
3. **NARRATIVA NATURAL**: Se usar um \`dialogue_box\` ou \`story_block\`, faça com que soe como uma conversa real, não como um robô lendo um dicionário.
4. **RESPEITO AO LEITOR**: O aluno deve sentir prazer em ler o material. Crie um fluxo ("Flow") contínuo entre a explicação e a prática.
`
