import { serve } from 'inngest/next';
import { inngest, functions } from '@/lib/inngest';

/**
 * API Route para o Inngest
 * 
 * Esta rota é chamada pelo Inngest Cloud para executar as funções.
 * O Inngest envia webhooks para cá quando há eventos a processar.
 * 
 * Endpoints (gerenciados automaticamente pelo serve()):
 * - GET  /api/inngest → Introspection (lista funções disponíveis)
 * - POST /api/inngest → Execução de funções
 * - PUT  /api/inngest → Sync de funções com o dashboard
 */
export const dynamic = 'force-dynamic';

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions,
});
