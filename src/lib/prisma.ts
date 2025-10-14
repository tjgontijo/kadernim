import { PrismaClient } from '@prisma/client'

// Modificar a URL de conexão para funcionar com pgBouncer
function getPrismaUrl() {
  const url = process.env.DATABASE_URL || ''
  
  // Se estiver usando Supabase, adicionar os parâmetros necessários para pgBouncer
  if (url.includes('supabase.co') || url.includes('pooler.supabase.com')) {
    // Verificar se a URL já tem os parâmetros necessários
    if (!url.includes('pgbouncer=true')) {
      // Verificar se a URL já tem outros parâmetros
      const hasParams = url.includes('?')
      const separator = hasParams ? '&' : '?'
      return `${url}${separator}pgbouncer=true`
    }
    
    // Adicionar connection_limit e pool_timeout se não existirem
    if (!url.includes('connection_limit=')) {
      return `${url}&connection_limit=1&pool_timeout=20`
    }
  }
  
  return url
}

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: getPrismaUrl(),
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
