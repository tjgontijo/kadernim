import { curatorAgent } from '../curator-agent/curator-agent';
import { reviewerAgent } from '../reviewer-agent/reviewer-agent';
import { PedagogicalEnrichmentSchema, ResourceReviewBatchSchema } from '../shared/schemas';

export async function orchestrateResourceEnrichment(input: {
  resourceTitle: string;
  subjectName: string;
  educationLevelName: string;
  availableGrades: string[];
}) {
  // 1. Enriquecimento Pedagógico
  const pedagogicalResult = await curatorAgent.generate(
    `Material: "${input.resourceTitle}". Matéria: ${input.subjectName}. Nível: ${input.educationLevelName}.
     Slugs de anos disponíveis: ${input.availableGrades.join(', ')}`,
    { structuredOutput: { schema: PedagogicalEnrichmentSchema } }
  );

  // 2. Geração de Reviews (com contexto do que foi gerado no passo 1)
  const reviewsResult = await reviewerAgent.generate(
    `Gere entre 5 e 9 reviews curtos e variados para o material: "${input.resourceTitle}". 
     Baseie-se nesta descrição pedagógica: ${pedagogicalResult.object.description}`,
    { structuredOutput: { schema: ResourceReviewBatchSchema } }
  );

  return {
    pedagogical: pedagogicalResult.object,
    reviews: reviewsResult.object.reviews,
  };
}
