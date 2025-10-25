export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UsersIcon, BookOpenIcon, GraduationCapIcon, LayersIcon, BellIcon, CreditCardIcon } from 'lucide-react'

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Painel de Administração</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gerenciar Usuários</div>
            <p className="text-xs text-muted-foreground mt-1">
              Administração de contas, permissões e assinaturas
            </p>
            <Link href="/admin/users" className="text-sm text-primary mt-4 inline-block">
              Acessar →
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recursos</CardTitle>
            <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gerenciar Recursos</div>
            <p className="text-xs text-muted-foreground mt-1">
              Adicionar, editar e remover recursos pedagógicos
            </p>
            <Link href="/admin/resources" className="text-sm text-primary mt-4 inline-block">
              Acessar →
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Níveis Educacionais</CardTitle>
            <GraduationCapIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gerenciar Níveis</div>
            <p className="text-xs text-muted-foreground mt-1">
              Configurar níveis educacionais do sistema
            </p>
            <Link href="/admin/education-levels" className="text-sm text-primary mt-4 inline-block">
              Acessar →
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disciplinas</CardTitle>
            <LayersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gerenciar Disciplinas</div>
            <p className="text-xs text-muted-foreground mt-1">
              Configurar disciplinas e áreas de conhecimento
            </p>
            <Link href="/admin/subjects" className="text-sm text-primary mt-4 inline-block">
              Acessar →
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planos</CardTitle>
            <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gerenciar Planos</div>
            <p className="text-xs text-muted-foreground mt-1">
              Configurar planos e assinaturas disponíveis
            </p>
            <Link href="/admin/plans" className="text-sm text-primary mt-4 inline-block">
              Acessar →
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notificações</CardTitle>
            <BellIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gerenciar Notificações</div>
            <p className="text-xs text-muted-foreground mt-1">
              Enviar e configurar notificações do sistema
            </p>
            <Link href="/admin/notification" className="text-sm text-primary mt-4 inline-block">
              Acessar →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
