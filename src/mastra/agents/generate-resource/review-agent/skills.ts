export const RESOURCE_REVIEW_CHECKLIST = `
## Checklist de revisão — critérios concretos

Avalie cada item. Sinalize issues com severidade real — não seja genérico.

### BNCC (categoria: BNCC)
- O conteúdo gerado reflete o verbo e o objeto de conhecimento da habilidade?
- Há pelo menos uma questão que avalia diretamente o que a habilidade pede?
- A descrição da habilidade no campo "skill.description" é fiel à BNCC fornecida?

### Pedagogia (categoria: PEDAGOGY)
- O material começa com contextualização antes das questões?
- Há progressão do mais simples ao mais complexo ao longo das páginas?
- Os tipos de questão são variados? (Mais de 3 questões iguais seguidas = issue MEDIUM)
- A distribuição de questões por nível cognitivo é razoável (não são todas memorização)?

### Linguagem (categoria: LANGUAGE)
- Os enunciados são claros e completos (contexto + instrução)?
- O vocabulário é adequado à faixa etária da fase?
- Algum enunciado é vago ("fale sobre", "escreva algo")? → issue HIGH
- As alternativas de múltipla escolha são plausíveis (sem distratores óbvios)?

### Estrutura (categoria: STRUCTURE)
- Todas as páginas começam com page_header e terminam com page_footer?
- O total de questões bate com o solicitado?
- As questões estão numeradas sequencialmente (sem reiniciar por página)?

### Critérios de shouldRefine
- shouldRefine = true se: qualquer issue HIGH, ou 2+ issues MEDIUM, ou há issues determinísticas
- shouldRefine = false se: apenas issues LOW ou nenhuma issue
`
