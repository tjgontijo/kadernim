'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { UserDropdownMenuGlobal } from '@/components/dashboard/users/user-dropdown-menu-global'
import { useResource } from '@/hooks/resources/use-resource-context'

interface DashboardHeaderProps {
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
    role?: string | null
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { isMobile } = useSidebar()
  const { resourceTitle, resourceSubject, resourceEducationLevel } = useResource()
  
  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U'

  const pathSegments = pathname.split('/').filter(Boolean)
  const isResourceDetail = pathSegments[0] === 'resources' && pathSegments.length > 1
  const rootSegment = pathSegments[0] || 'resources'

  const rootLabelMap: Record<string, string> = {
    resources: 'Biblioteca',
    favorites: 'Meus favoritos',
    planner: 'Planejador',
    diretrizes: 'Diretrizes',
    discover: 'Descobrir',
    admin: 'Painel Admin',
    account: 'Conta',
    billing: 'Assinatura',
  }

  const rootLabel = rootLabelMap[rootSegment] || rootSegment
  const rootHref = `/${rootSegment}`
  
  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 px-4 sm:px-[32px] py-[16px] border-b border-line bg-[oklch(0.975_0.012_85_/_0.92)] backdrop-blur-md">
      {isMobile && <SidebarTrigger className="-ml-2 mr-2 shrink-0" />}
      
      <nav className="flex items-center gap-[8px] text-[13px] text-ink-mute flex-1 min-w-0">
        <Link href={rootHref} className="hover:text-ink truncate transition-colors text-ink-mute">{rootLabel}</Link>
        {isResourceDetail && (
          <>
            {resourceSubject && (
              <>
                <span className="text-line">/</span>
                <Link href="#" className="hover:text-ink truncate transition-colors text-ink-mute">{resourceSubject}</Link>
              </>
            )}
            {resourceEducationLevel && (
              <>
                <span className="text-line">/</span>
                <Link href="#" className="hover:text-ink truncate transition-colors text-ink-mute">{resourceEducationLevel}</Link>
              </>
            )}
            <span className="text-line">/</span>
            <span className="text-ink font-medium truncate">{resourceTitle || 'Detalhe do Recurso'}</span>
          </>
        )}
        {!isResourceDetail && pathSegments.length > 1 && pathSegments[0] !== 'resources' && (
           <>
              <span className="text-line">/</span>
              <span className="text-ink font-medium truncate">{pathSegments[0] === 'admin' ? 'Painel Admin' : pathSegments[1]}</span>
           </>
        )}
      </nav>

      <div className="shrink-0 flex items-center gap-[16px]">
        {isResourceDetail && (
          <button 
            onClick={() => router.back()} 
            className="hidden sm:inline-flex items-center justify-center gap-[8px] px-[14px] py-[8px] font-body text-[13px] font-semibold text-ink-soft bg-transparent border-none hover:bg-paper-2 hover:text-ink rounded-full transition-colors shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-[16px] h-[16px]"><path d="M15 6l-6 6 6 6"/></svg>
            Voltar
          </button>
        )}

        <UserDropdownMenuGlobal 
          userName={user.name || 'Usuário'} 
          userEmail={user.email || ''} 
          userImage={user.image}
          customTrigger={
            <button className="w-[36px] h-[36px] rounded-full bg-terracotta-2 text-terracotta flex items-center justify-center font-display font-semibold text-[14px] border-2 border-card shadow-1 cursor-pointer hover:-translate-y-px transition-transform hover:shadow-2 shrink-0">
              {initials}
            </button>
          }
        />
      </div>
    </header>
  )
}
