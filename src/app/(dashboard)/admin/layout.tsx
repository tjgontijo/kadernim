import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth/roles'
import { UserRoleType } from '@/types/user-role'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    // Verificar sessão
    const session = await auth.api.getSession({
      headers: await headers()
    })
    
    if (!session?.user) {
      notFound()
    }
    
    // Buscar role do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })
    
    // Se não é admin, retorna 404 (faz parecer que a página não existe)
    if (!isAdmin(user?.role as UserRoleType)) {
      notFound()
    }
    
    return <>{children}</>
  } catch (error) {
    console.error('Erro ao verificar permissões admin:', error)
    notFound()
  }
}