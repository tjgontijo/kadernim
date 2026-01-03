import { PrismaClient, Prisma } from '@db/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

const connectionString = process.env.DATABASE_URL

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(
      new Pool({
        connectionString,
      })
    ),
    log: process.env.NODE_ENV === 'development'
      ? ['error', 'warn']
      : ['error', 'warn'],
  })

// Re-export Prisma namespace for SQL operations
export { Prisma }

// Log de inicialização
if (process.env.NODE_ENV === 'production') {
  //console.log('[prisma] Inicializado em produção')
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
