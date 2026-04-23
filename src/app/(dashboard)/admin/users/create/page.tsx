import { UserCreatePageClient } from '@/components/dashboard/users/user-create-page-client'

export const metadata = {
  title: 'Novo Usuário',
  description: 'Criar novo usuário na plataforma',
}

export default function AdminUserCreatePage() {
  return <UserCreatePageClient />
}
