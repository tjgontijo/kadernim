export const RESOURCE_OUTPUT_CONTRACT = `
## Contrato de saída

- Responda apenas em JSON válido.
- Não use markdown.
- Não invente campos fora do schema solicitado.
- Mantenha coerência entre número de página e ordem das páginas.
`

export const RESOURCE_PEDAGOGICAL_FIDELITY = `
## Critérios de fidelidade pedagógica

- **AUTOSSUFICIÊNCIA (CRÍTICO)**: O aluno DEVE ter todo o repertório necessário no texto base para responder a TODAS as questões.
- **PROFUNDIDADE E HISTORICIDADE**: Rejeite resumos genéricos de "Educação Moral e Cívica". Se a habilidade for de História (ex: cidadania), exija que o material cite a *construção histórica* dos direitos (lutas de indígenas, afro-brasileiros, mulheres, etc).
- **SITUAÇÃO-PROBLEMA**: Todo material de ciências humanas deve apresentar um "estudo de caso" concreto ou situação-problema escolar/comunitária para conectar o conceito à realidade do aluno.
- **QUALIDADE DAS QUESTÕES**: Rejeite questões de múltipla escolha com alternativas obviamente absurdas ou bobas. Rejeite questões abertas sem "andaime" (scaffolding).
- **ESTRUTURA DE PRODUÇÃO FINAL**: Se houver um desafio final ou plano de ação, ele DEVE ser estruturado em passos (ex: usando 'data_table'). Rejeite se for apenas um prompt solto com linhas em branco.
`
