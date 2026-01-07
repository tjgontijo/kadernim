import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { auth } from '@/server/auth';
import { logLlmUsage } from '@/services/llm/llm-usage-service';

/**
 * POST /api/v1/lesson-plans/refine-theme
// ... (omitting comments for brevity in replacement chunk but keeping them in real file)
 */

const RequestSchema = z.object({
  rawTheme: z.string().min(3, 'Tema muito curto'),
  educationLevelSlug: z.string(),
  gradeSlug: z.string(),
  subjectSlug: z.string(),
  seed: z.number().optional().default(0),
});

const RefinedThemesSchema = z.object({
  short: z.string().describe('Versão curta e objetiva do tema (máximo 6 palavras)'),
  medium: z
    .string()
    .describe('Versão média do tema com contexto pedagógico (máximo 15 palavras)'),
  long: z
    .string()
    .describe(
      'Versão descritiva e completa do tema alinhada com BNCC (máximo 25 palavras)'
    ),
});

export async function POST(request: Request) {
  const startTime = Date.now();
  const session = await auth.api.getSession({ headers: request.headers });
  const userId = session?.user?.id;
  const model = 'gpt-4o-mini';

  try {
    const body = await request.json();
    const validated = RequestSchema.parse(body);

    const { rawTheme, educationLevelSlug, gradeSlug, subjectSlug, seed } = validated;

    // Mapear slugs para nomes legíveis
    const levelNames: Record<string, string> = {
      'educacao-infantil': 'Educação Infantil',
      'ensino-fundamental-1': 'Ensino Fundamental I',
      'ensino-fundamental-2': 'Ensino Fundamental II',
      'ensino-medio': 'Ensino Médio',
    };

    const isEI = educationLevelSlug === 'educacao-infantil';
    const levelName = levelNames[educationLevelSlug] || educationLevelSlug;

    // Construir sistema de prompt específico
    const systemPrompt = isEI
      ? `Você é um especialista em Educação Infantil brasileira. Sua tarefa é refinar temas de aulas em "experiências de aprendizagem" profissionais.
          Regras para EI:
          - Use linguagem voltada ao brincar, interagir e explorar.
          - Evite termos formais demais como "Estudo de...". Use "Exploração de...", "Descoberta de...".
          - Alinhe aos Campos de Experiência da BNCC.`
      : `Você é um especialista em Ensino Fundamental brasileiro. Sua tarefa é refinar temas de aulas em objetos de conhecimento formais e pedagógicos.
          Regras para EF:
          - Use linguagem técnica e acadêmica adequada ao ano escolar.
          - Foque nos Objetos de Conhecimento da BNCC.`;

    const contextLabel = isEI ? 'Faixa Etária' : 'Ano/Série';
    const subjectLabel = isEI ? 'Campo de Experiência' : 'Componente Curricular';

    const userPrompt = `Refine o seguinte tema de aula:
    **Tema original:** "${rawTheme}"
    **Contexto:**
    - Nível de ensino: ${levelName}
    - ${contextLabel}: ${gradeSlug}
    - ${subjectLabel}: ${subjectSlug}

    Gere 3 versões refinadas:
    1. **Curta**: Objetiva (máximo 6 palavras)
    2. **Média**: Com contexto pedagógico (máximo 15 palavras)
    3. **Longa**: Descritiva e alinhada com BNCC (máximo 25 palavras)`;

    // Gerar refinamentos com IA
    const { object, usage } = await generateObject({
      model: openai(model),
      system: systemPrompt,
      prompt: userPrompt,
      schema: RefinedThemesSchema,
      temperature: 0.8 + seed * 0.1,
    });

    // Log de sucesso
    const promptTokens = (usage as any).promptTokens ?? (usage as any).prompt_tokens ?? 0;
    const completionTokens = (usage as any).completionTokens ?? (usage as any).completion_tokens ?? 0;

    await logLlmUsage({
      userId,
      feature: 'theme-refinement',
      operation: `Refinar tema: "${rawTheme}"`,
      model,
      inputTokens: promptTokens,
      outputTokens: completionTokens,
      latencyMs: Date.now() - startTime,
      status: 'success',
      metadata: {
        rawTheme,
        educationLevel: educationLevelSlug,
        seed,
      },
      // Passar objeto raw p/ debug no service se os tokens forem 0
      rawUsage: usage
    } as any);

    // Formatar resposta
    const refined = [
      { version: 'short', text: object.short },
      { version: 'medium', text: object.medium },
      { version: 'long', text: object.long },
    ];

    return NextResponse.json({
      success: true,
      data: {
        original: rawTheme,
        refined,
      },
    });
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Log de erro (apenas se não for erro de validação do RequestSchema)
    if (!(error instanceof z.ZodError)) {
      await logLlmUsage({
        userId,
        feature: 'theme-refinement',
        operation: `Refinar tema (Falha)`,
        model,
        inputTokens: 0,
        outputTokens: 0,
        latencyMs,
        status: 'error',
        errorMessage,
      });
    }

    console.error('[POST /api/v1/lesson-plans/refine-theme] Error:', error);

    // Erros de validação
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    // Erros da OpenAI
    if (error instanceof Error) {
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Limite de requisições atingido. Tente novamente em alguns segundos.',
          },
          { status: 429 }
        );
      }

      if (error.message.includes('401') || error.message.includes('authentication')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Erro de configuração do serviço.',
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao refinar tema. Tente novamente.',
      },
      { status: 500 }
    );
  }
}
