export const REVIEW_CHECKLIST = `Checklist (nesta ordem):
1. Fidelidade: BNCC/steps/objetivos batem com snapshot?
2. Duracao total do flow dentro de ±8 min do alvo?
3. Coerencia objetivo <-> flow <-> avaliacao?
4. materials, preparation e adaptations preenchidos e viaveis?
5. useResourceStepIds validos em cada etapa?

Severidade:
- HIGH: violacao de fidelidade, duracao fora, listas vazias.
- MEDIUM: coerencia fraca, adaptations genericas.
- LOW: fraseado melhoravel.

shouldRefine=true se houver qualquer HIGH ou se deterministicIssues nao estiver vazio.
fixBrief: instrucao curta (1-2 frases) de como corrigir.`
