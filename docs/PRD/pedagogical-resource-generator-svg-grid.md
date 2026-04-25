# PRD: Gerador de Recursos Pedagógicos (SVG + Grid A4)

**Versao:** 0.1 - PRD Inicial  
**Data:** 2026-04-25  
**Status:** Draft  
**Prioridade:** Alta

---

## 1. Visao Geral

Construir um **gerador de folhas pedagógicas A4** baseado em:

- biblioteca de blocos visuais (SVG customizados),
- motor de layout por grid (sem sobreposição),
- composição automática de conteúdo (perguntas + linhas de resposta),
- exportação para PNG/PDF via Playwright.

Objetivo principal: permitir criação de materiais visuais consistentes, escaláveis e editáveis por dados (JSON), sem depender de edição manual em Canva.

---

## 2. Problema

Hoje, criar atividades com estética editorial exige trabalho manual, o que reduz escala, padronização e velocidade.

Principais dores:

1. Criação visual depende de ferramenta externa e processo artesanal.
2. Difícil reaproveitar layouts com variações de conteúdo.
3. Risco de inconsistência visual e de composição (texto estourando, elementos sobrepostos).
4. Pouca automação para gerar séries de materiais (mesmo tema, múltiplas versões).

---

## 3. Objetivos

1. Criar pipeline de geração de páginas A4 orientado a dados.
2. Garantir posicionamento previsível sem sobreposição usando grid.
3. Suportar variação de conteúdo preservando identidade visual.
4. Permitir reuso de blocos gráficos via biblioteca SVG.
5. Exportar saídas prontas para uso (PDF e preview PNG).

---

## 4. Nao Objetivos (MVP)

- Editor WYSIWYG completo de diagramação.
- IA de ilustração dentro do produto.
- Compatibilidade com todos os formatos de página (apenas A4 no MVP).
- Conversão automática de layouts de Canva.
- Geração automática de dezenas de páginas em um único documento complexo (foco inicial: 1-3 páginas por execução).

---

## 5. Publico-Alvo

- Time editorial/pedagógico que precisa montar atividades com rapidez.
- Operação de conteúdo que gera variações por série/tema/disciplina.

---

## 6. Arquitetura Proposta

### 6.1 Componentes

1. **Block Library**
- Conjunto de blocos SVG reutilizáveis (`frame-rounded`, `frame-dashed`, `note-tape`, `tag`, etc.).
- Cada bloco define área útil interna para texto.

2. **Grid Engine**
- Define malha da página (ex.: 12 colunas x 18 linhas).
- Resolve ocupação por `rowSpan`/`colSpan`.
- Impede colisão entre blocos.

3. **Template DSL (JSON)**
- Descreve estrutura da página em slots.
- Separa layout (estrutura) de conteúdo (questões).

4. **Composer**
- Insere conteúdo nos slots.
- Aplica estilos tipográficos.
- Gera HTML final para render.

5. **Overflow Guard**
- Mede overflow por bloco.
- Estratégia de fallback: truncar com regra, trocar bloco, ou paginar.

6. **Renderer**
- Playwright para gerar PNG (preview) e PDF (A4 final).

### 6.2 Estrutura de pastas (sugestao)

```txt
src/lib/worksheet-engine/
  blocks/
    svg/
    registry.ts
  grid/
    layout-engine.ts
    collision.ts
  schemas/
    worksheet-template.ts
    worksheet-content.ts
  compose/
    html-composer.ts
    overflow-guard.ts
  render/
    playwright-renderer.ts
  templates/
    portugues-fund1-v1.json
scripts/worksheets/
  generate-worksheet.ts
```

---

## 7. Modelo de Dados

### 7.1 Bloco (registry)

```ts
type BlockDef = {
  id: string
  svgAsset: string
  minCols: number
  minRows: number
  textArea: { x: number; y: number; width: number; height: number } // percentual
  defaultLineCount: number
  supportedQuestionTypes: Array<'open_short' | 'open_long' | 'multiple_choice' | 'fill_blank'>
}
```

### 7.2 Slot de template

```ts
type TemplateSlot = {
  id: string
  blockId: string
  col: number
  row: number
  colSpan: number
  rowSpan: number
  questionType: 'open_short' | 'open_long' | 'multiple_choice' | 'fill_blank'
}
```

### 7.3 Conteudo

```ts
type QuestionContent = {
  id: string
  number: number
  prompt: string
  options?: string[]
  expectedLines?: number
}
```

---

## 8. Requisitos Funcionais

1. Definir página A4 fixa com grid configurável.
2. Posicionar blocos por slot (`col/row/span`), sem sobreposição.
3. Renderizar título, seção e questões dentro da área útil do bloco.
4. Inserir linhas de resposta conforme tipo de questão.
5. Exportar:
- PNG preview de alta qualidade.
- PDF A4 com `printBackground`.
6. Validar overflow antes de finalizar.
7. Permitir gerar múltiplas variações trocando apenas conteúdo.

---

## 9. Requisitos Nao Funcionais

1. **Qualidade visual:** legibilidade em impressão comum.
2. **Consistência:** mesmo template produz resultado previsível.
3. **Performance:** geração de 1 página em até 5s local (meta inicial).
4. **Manutenibilidade:** blocos e templates desacoplados da lógica de render.
5. **Auditabilidade:** salvar JSON de entrada junto do artefato exportado.

---

## 10. Regras de Layout (Anti-Colisao)

1. Todo slot ocupa células discretas da grid.
2. Nenhum slot pode compartilhar célula com outro.
3. Cada bloco tem tamanho mínimo (`minCols/minRows`).
4. Margens internas do bloco devem respeitar `textArea`.
5. Se conteúdo exceder:
- tentativa 1: reduzir linhas opcionais;
- tentativa 2: mover para slot maior compatível;
- tentativa 3: abrir nova página.

---

## 11. Pipeline de Geração (MVP)

1. Selecionar template JSON.
2. Carregar questões (manual ou geradas).
3. Validar compatibilidade `questionType x block`.
4. Rodar layout engine.
5. Compor HTML final.
6. Rodar overflow guard.
7. Exportar PNG + PDF.
8. Persistir artefatos e metadados (opcional no MVP).

---

## 12. UX/Produto (MVP Técnico)

MVP pode iniciar por script/CLI:

```bash
npx tsx scripts/worksheets/generate-worksheet.ts \
  --template portugues-fund1-v1 \
  --input ./data/questions.json \
  --out ./docs/resources/generated
```

Fase 2: expor no dashboard com “Gerar variação”.

---

## 13. Observacoes Legais e de Conteudo

1. Não reutilizar branding de terceiros.
2. Não copiar páginas originais 1:1.
3. Criar SVGs proprietários e linguagem visual própria.
4. Garantir rastreabilidade da origem do conteúdo textual.

---

## 14. Plano de Entrega

### Fase 1 - Fundacao (1 sprint)
- Grid engine básico.
- 4 blocos SVG.
- 1 template funcional.
- Export PNG/PDF.

### Fase 2 - Robustez (1 sprint)
- Overflow guard com paginação.
- 8-12 blocos SVG.
- 3 templates por disciplina.

### Fase 3 - Produto (1 sprint)
- Integração com dashboard.
- Geração de variações em lote.
- Metadados e histórico.

---

## 15. Criterios de Aceite (MVP)

1. Gerar uma página A4 sem sobreposição de elementos.
2. Renderizar ao menos 6 questões distribuídas em blocos diferentes.
3. Exportar PNG de alta resolução e PDF A4.
4. Passar validação de overflow em todos os slots.
5. Permitir trocar conteúdo mantendo o mesmo template sem quebrar layout.

---

## 16. Riscos e Mitigacoes

1. **Overflow frequente**  
Mitigação: limites por tipo de questão + fallback de paginação.

2. **Biblioteca SVG inconsistente**  
Mitigação: guideline de design + revisão por token visual (espessura, margens, área útil).

3. **Baixa qualidade de impressão**  
Mitigação: export em alta densidade e validação com amostras impressas.

4. **Complexidade excessiva no MVP**  
Mitigação: escopo inicial com poucos blocos e um template canônico.

---

## 17. Metricas de Sucesso

1. Tempo médio de geração por página.
2. Taxa de falha por overflow.
3. Número de variações geradas por template.
4. Tempo editorial economizado por material.
5. Taxa de reaproveitamento de blocos SVG.

---

## 18. Proximos Passos

1. Definir grid oficial do MVP (`12x18` ou `24x36`).
2. Produzir pacote inicial de blocos SVG proprietários.
3. Implementar motor base e um template “estilo page-007”.
4. Validar com 10 saídas reais e ajustar regras de overflow.

