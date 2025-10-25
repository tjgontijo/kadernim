'use client'

import { SubjectsTable } from './SubjectsTable'
import { useSession } from '@/lib/auth/auth-client'
import { Shield } from 'lucide-react'
import { isAdmin } from '@/lib/auth/roles'
import { UserRoleType } from '@/types/user-role'

export function SubjectsClient() {
  // Middleware já garantiu que há sessão
  const { data: session } = useSession()
  const userIsAdmin = isAdmin(session?.user?.role as UserRoleType)

  if (!userIsAdmin) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Acesso Restrito</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    )
  }

  return <SubjectsTable />
}
