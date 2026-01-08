# PRD – Wizard de Criação de Plano de Aula BNCC

## 1. Visão Geral

Este PRD descreve a implementação de um wizard de criação de plano de aula alinhado à BNCC, pensado para professores da **Educação Infantil** e **Ensino Fundamental (1 e 2)**.

O foco é reduzir esforço cognitivo, respeitar o fluxo mental real do professor e garantir alinhamento pedagógico e normativo, sem exigir domínio técnico da BNCC.

O sistema oferece duas formas de entrada que podem ser usadas simultaneamente:
- **Seleção direta:** professor escolhe habilidades BNCC de uma lista filtrada
- **Descrição livre:** professor descreve o que quer trabalhar e o sistema sugere habilidades

Ambos os caminhos convergem para o mesmo plano final.

---

## 2. Objetivos do Produto

- Permitir que um professor gere um plano de aula utilizável em **até 3 minutos**
- Garantir alinhamento explícito com BNCC sem exigir leitura do documento oficial
- Evitar planos genéricos, forçando recorte pedagógico claro
- Reduzir abandono do wizard (sensação de "formulário longo")
- Gerar planos reutilizáveis, versionáveis e exportáveis

---

## 3. Público-alvo

### Primário
- Professores da Educação Infantil
- Professores do Ensino Fundamental 1 e 2
- Coordenadores pedagógicos

### Características do usuário
- Pouco tempo disponível
- Linguagem prática, não técnica
- Foco em "o que vou fazer amanhã em sala"
- BNCC vista como obrigação institucional, não como ponto de partida
- Não quer decorar códigos

---

## 4. Princípios de UX e Pedagogia

- Sistema atua como **assistente**, não como formulário
- Linguagem prática e acolhedora
- BNCC aparece como **suporte**, não como exigência inicial
- Sempre oferecer sugestões antes de pedir escrita livre
- Limitar escolhas para caber no tempo da aula
- **Uma habilidade principal por aula** (evita planos genéricos)
- Wizard em **3 momentos visíveis** (não 9 steps)

---

## 5. Bifurcação: Educação Infantil vs Ensino Fundamental

O sistema adapta terminologia e dados conforme a etapa selecionada:

| Aspecto | Ensino Fundamental | Educação Infantil |
|---------|-------------------|-------------------|
| Step 2 | Ano (1º ao 9º) | Faixa Etária (Bebês, Crianças bem pequenas, Crianças pequenas) |
| Step 3 | Disciplina | Campo de Experiência |
| Códigos | EFxxXXxx | EIxxXXxx |
| Terminologia | "Habilidade BNCC" | "Objetivo de Aprendizagem" |
| Exemplo | EF03MA09 | EI03EO01 |

O fluxo do wizard é o mesmo, apenas labels e fontes de dados mudam.

---

## 6. Estrutura do Wizard

### Visão do Usuário: 3 Momentos

O usuário percebe apenas **3 momentos**, não 9 steps. Isso reduz a sensação de formulário longo.

```
[●───────────────────] Contexto
[────────●──────────] Conteúdo  
[─────────────────●] Revisão
```

---

### Momento 1 – Contexto da Aula

**O que pergunta:** Para quem é essa aula?

**Campos (1 tela, 4 seleções):**
- Etapa de Ensino (Educação Infantil, Fundamental 1, Fundamental 2)
- Ano ou Faixa Etária
- Disciplina ou Campo de Experiência
- Duração (1, 2 ou 3 aulas)

**Fonte de dados:**
- `/api/v1/education-levels`
- `/api/v1/grades?educationLevelSlug=...`
- `/api/v1/subjects?educationLevelSlug=...&gradeSlug=...&bnccOnly=true`

**Regras:**
- Todos os campos são obrigatórios
- Campos se adaptam conforme etapa selecionada (ex: EI mostra Campos de Experiência)
- Duração vem antes do conteúdo para limitar escopo

**UI sugerida:**
- Cards grandes para Etapa de Ensino (primeira seleção)
- Selects ou chips para os demais
- Transição suave entre seleções

---

### Momento 2 – O que será trabalhado

**O que pergunta:** O que você quer que seus alunos façam ou aprendam nesta aula?

> Esta formulação é intencional: foca na **ação do aluno**, não no conteúdo abstrato. Isso melhora drasticamente a qualidade do `intentRaw` e guia a professora para um recorte mais prático.

**Duas opções na mesma tela (não mutuamente exclusivas):**

#### Opção A – Escolher Habilidades BNCC

**UI:**
- Lista de habilidades filtrada por contexto (etapa + ano + disciplina)
- Campo de busca com autocomplete (busca em código E descrição)
- Cards com: `código` em destaque + `descrição` truncada + `knowledgeObject`
- Checkbox para seleção múltipla
- Limite: **1 principal (obrigatória)** + **até 2 complementares**

**Fonte:**
- `/api/v1/bncc/skills?educationLevelSlug=...&gradeSlug=...&subjectSlug=...`

**Comportamento:**
- Primeira seleção automaticamente vira "principal"
- Badge visual diferencia principal de complementar
- Pode trocar a principal a qualquer momento

---

#### Opção B – Descrever a intenção

**UI:**
- Textarea: "O que você quer trabalhar nesta aula?"
- Chips de sugestões curadas (ex: "Tabuada", "Frações", "Leitura")
- Ao clicar em sugestão, preenche o textarea

**Comportamento:**
- Ao digitar/selecionar, sistema busca habilidades relacionadas
- Mostra lista de sugestões BNCC baseada no texto
- Professora seleciona 1-3 das sugestões

**Fonte:**
- `/api/v1/bncc/themes` (sugestões curadas)
- `/api/v1/bncc/skills?q=...&searchMode=hybrid` (busca por texto)

---

**Output do Momento 2:**
```json
{
  "intentRaw": "Quero trabalhar frações com material concreto",
  "selectedSkills": [
    { "code": "EF03MA09", "role": "main" },
    { "code": "EF03MA10", "role": "complementary" }
  ]
}
```

**Regra de validação:**
- Pelo menos 1 habilidade deve ser selecionada (via Opção A ou B)

---

### Momento 3 – Revisão e Geração

**O que mostra:** Plano completo gerado automaticamente

O sistema **gera automaticamente** todos os campos abaixo com base nos inputs anteriores.

**Aviso importante na UI:**
> "O tema e a estrutura da aula foram gerados automaticamente com base nas suas escolhas. Você pode editar qualquer campo antes de finalizar."

Isso reduz ansiedade e evita a sensação de que algo ficou faltando.

**Seções exibidas:**
1. **Identificação**
   - Etapa, Ano, Disciplina, Duração
   - Tema (baseado em intentRaw ou knowledgeObject da habilidade principal)

2. **Habilidades BNCC**
   - Principal (destaque visual)
   - Complementares (se houver)
   - Código + descrição completa

3. **Objetivo da Aula**
   - Gerado automaticamente via IA
   - Baseado na habilidade principal + intent

4. **Estrutura da Aula**
   - Abertura/Retomada (tempo sugerido)
   - Atividade Principal (detalhada)
   - Fechamento/Sistematização
   - Distribuição de tempo proporcional à duração

5. **Materiais Necessários**
   - Lista gerada baseada na atividade

6. **Evidências de Aprendizagem**
   - Tipo sugerido (observação, produção, exit ticket)
   - Critérios de sucesso

**Ações disponíveis:**
- Editar inline qualquer campo (clique para editar)
- **Gerar Plano** → POST `/api/v1/lesson-plans`
- Estados: loading com progresso → sucesso com opções

**Pós-sucesso:**
- Visualizar plano formatado
- Baixar PDF
- Baixar DOCX
- Criar novo plano

---

## 7. APIs Necessárias

### Existentes (já implementadas)
| Rota | Descrição |
|------|-----------|
| `GET /api/v1/education-levels` | Lista etapas de ensino |
| `GET /api/v1/grades` | Lista anos/faixas etárias |
| `GET /api/v1/subjects` | Lista disciplinas/campos |
| `GET /api/v1/bncc/skills` | Lista habilidades BNCC |
| `GET /api/v1/bncc/themes` | Sugestões de temas curados |
| `POST /api/v1/lesson-plans` | Cria plano de aula |
| `POST /api/v1/lesson-plans/refine-theme` | Refina tema com IA |

### Novas (a implementar)
| Rota | Descrição |
|------|-----------|
| `POST /api/v1/lesson-plans/generate-content` | Gera objetivo, estrutura, materiais e evidências |

---

## 8. Payload de Criação do Plano

```json
{
  "educationLevelSlug": "ensino-fundamental-1",
  "gradeSlug": "ef1-3-ano",
  "subjectSlug": "matematica",
  "durationMinutes": 50,
  "numberOfClasses": 1,
  "intentRaw": "Quero trabalhar frações com material concreto",
  "skills": [
    { "code": "EF03MA09", "role": "main" },
    { "code": "EF03MA10", "role": "complementary" }
  ]
}
```

**Resposta da API:**
```json
{
  "success": true,
  "data": {
    "id": "plan_xxxx",
    "title": "Introdução às Frações com Material Concreto",
    "objective": "...",
    "structure": {
      "opening": "...",
      "mainActivity": "...",
      "closing": "..."
    },
    "materials": ["..."],
    "evidence": {
      "type": "production",
      "criteria": ["...", "..."]
    }
  }
}
```

---

## 9. Log de Decisões Invisível

Internamente, o sistema deve registrar para cada plano gerado:

| Campo | Descrição |
|-------|----------|
| `suggestedSkillsReason` | Por que cada habilidade foi sugerida |
| `activityTypeReason` | Por que esse tipo de atividade foi escolhido |
| `timeDistributionReason` | Por que o tempo foi distribuído assim |
| `materialsReason` | Por que esses materiais foram sugeridos |

**Utilidade:**
- Debug de prompts e ajuste de qualidade
- Explicações para coordenação pedagógica ("Por que esse plano tem essa estrutura?")
- Auditoria de decisões da IA
- Base para melhorias futuras

Esses logs ficam no campo `metadata` do `LessonPlan` e não são exibidos ao usuário, a menos que explicitamente solicitados.

---

## 10. Tratamento de Erros da IA

### Quando a IA "erra"

| Cenário | Comportamento |
|---------|---------------|
| Habilidade sugerida não faz sentido | Permitir ignorar e buscar outra |
| Estrutura incompatível com duração | Mostrar aviso, não bloquear |
| Objetivo genérico demais | Permitir edição inline |
| Geração falha (timeout/erro) | Retry automático + fallback simplificado |

### Correções sem reiniciar

O usuário pode:
- Voltar a qualquer momento anterior
- Editar campos no Momento 3 sem perder contexto
- Regenerar apenas uma seção específica (ex: só o objetivo)

---

## 11. Métricas de Sucesso

| Métrica | Meta |
|---------|------|
| Tempo médio de criação | < 3 minutos |
| Taxa de conclusão do wizard | > 80% |
| Planos gerados por usuário/mês | > 4 |
| NPS da feature | > 50 |
| Taxa de edição pós-geração | < 30% (indica boa qualidade de geração) |

---

## 12. Fora de Escopo (V1)

- Edição avançada pós-geração (versão 2)
- Compartilhamento de planos entre professores
- Biblioteca de planos públicos
- Integração com calendário escolar
- Modo "Plano Rápido" (1 tela única) – considerar para V2

---

## 13. Dependências Técnicas

- React Query para cache de taxonomia
- Streaming de resposta IA para feedback de progresso
- Prisma para consultas BNCC com FTS/vetorial
- PDF/DOCX generation (já implementado)
- Campo `metadata` no modelo `LessonPlan` para logs invisíveis

---

## 14. Próximos Passos

1. [ ] Validar fluxo com 3-5 professoras reais
2. [ ] Prototipar telas do Momento 1 e 2
3. [ ] Revisar contrato e prompt do `generate-content`
4. [ ] Definir heurísticas para tratamento de erros da IA
5. [ ] Desenhar tela do Momento 2 em nível de componentes
6. [ ] Implementar `POST /api/v1/lesson-plans/generate-content`
7. [ ] Ajustar componentes Quiz existentes para novo fluxo
8. [ ] Testes de usabilidade com professoras reais
