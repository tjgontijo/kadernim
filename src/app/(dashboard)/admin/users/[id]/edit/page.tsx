import { UserEditPageClient } from '@/components/dashboard/users/user-edit-page-client'

export const metadata = {
  title: 'Editar Usuário',
  description: 'Editar dados de usuário na plataforma',
}

export default async function AdminUserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <UserEditPageClient userId={id} />
}
