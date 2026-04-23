import { curatorAgent } from '../curator-agent/curator-agent';
import { PedagogicalEnrichmentSchema } from '../shared/schemas';

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

  return {
    pedagogical: pedagogicalResult.object,
  };
}
