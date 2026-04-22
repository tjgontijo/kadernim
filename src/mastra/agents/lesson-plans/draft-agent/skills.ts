export const DRAFT_FLOW_RULES = `Estrutura do flow (sequencia didatica brasileira):
Divida o tempo em 3 momentos na seguinte proporcao:
  1. Abertura (10-20%): engajamento, ativacao de conhecimento previo, apresentacao do objetivo.
  2. Desenvolvimento (60-70%): atividade principal com o recurso, protagonismo do aluno.
  3. Fechamento (15-25%): sistematizacao, registro, avaliacao formativa.

Regras de duracao e qualidade:
  - Soma de durationMinutes de todas as etapas = duracao alvo ±8 min.
  - Nenhuma etapa com durationMinutes < 5 min (exceto se duracao total <= 30 min).
  - Nunca crie uma etapa so para "fechar o tempo".

teacherActions (por etapa):
  - Verbos imperativos e praticos: "Apresente...", "Questione...", "Oriente...", "Observe...".
  - O professor facilita e questiona, nao apenas "explica" ou "faz".
  - Inclua ao menos 1 pergunta instigadora por etapa de desenvolvimento.

studentActions (por etapa):
  - Aluno como protagonista: "Discute em duplas...", "Registra no caderno...", "Apresenta para a turma...".
  - Nunca use "Ouve o professor" como unica acao.
  - Acao deve ser concreta e observavel (evidencia de aprendizado).`

export const DRAFT_FIELD_RULES = `Regras por campo:

objective: Uma frase clara com verbo cognitivista (identificar, analisar, produzir, comparar).
  Derivada diretamente das habilidades BNCC do recurso.

bncc: Copie EXATAMENTE os codigos e descricoes do snapshot. Nunca invente ou resuma.

materials: Lista de itens fisicos/digitais necessarios. Minimo 2 itens reais (papel, quadro, projetor, etc).

preparation: Passos praticos do professor ANTES da aula (imprimir, separar materiais, testar tecnologia).
  Minimo 2 itens. Nao repita os materiais.

assessment.evidence: 2-3 comportamentos observaveis durante a aula que comprovam aprendizado.
  Ex: "Aluno nomeia corretamente X", "Aluno consegue resolver Y sem ajuda".

assessment.quickCheck: 1 pergunta oral ou tarefa de 1-2 min para o professor verificar no final.
  Ex: "Peca para 3 alunos explicar X com suas palavras."

adaptations.lessTime: Se sobrar pouco tempo, qual etapa pode ser encurtada sem perder o objetivo?
adaptations.moreDifficulty: Desafio adicional para alunos que terminarem cedo.
adaptations.groupWork: Como reorganizar para trabalho em grupo (duplas, pequenos grupos, circulo).

teacherNotes: Dicas praticas sobre o recurso especifico (ex: "o video comeca devagar, prepare os alunos").
  Pode ficar vazio se nao houver nada relevante.`
