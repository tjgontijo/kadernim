'use client'

import { Fragment } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useResource } from '@/contexts/resource-context'

// Route labels mapping (excluding /admin prefix)
const ROUTE_LABELS: Record<string, string> = {
  '': 'Dashboard',
  'resources': 'Recursos',
  'users': 'Usuários',
  'organizations': 'Organizações',
  'analytics': 'Analytics',
  'settings': 'Configurações',
  'automations': 'Automações',
  'campaigns': 'Campanhas',
  'templates': 'Templates',
  'subjects': 'Disciplinas',
  'community-requests': 'Pedidos da Comunidade',
  'llm-usage': 'Monitoramento IA',
}

function getRouteLabel(segment: string, fullPath: string): string {
  if (ROUTE_LABELS[fullPath]) return ROUTE_LABELS[fullPath]
  if (ROUTE_LABELS[segment]) return ROUTE_LABELS[segment]
  return segment.charAt(0).toUpperCase() + segment.slice(1)
}

type BreadcrumbItemData = {
  label: string
  href: string
  isCurrentPage: boolean
}

function generateBreadcrumbs(pathname: string, resourceTitle?: string | null): BreadcrumbItemData[] {
  const withoutAdmin = pathname.replace(/^\/admin\/?/, '')

  if (!withoutAdmin) {
    return [{ label: 'Dashboard', href: '/admin', isCurrentPage: true }]
  }

  const segments = withoutAdmin.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItemData[] = []
  let currentPath = ''

  segments.forEach((segment, index) => {
    currentPath += (currentPath ? '/' : '') + segment
    const isLast = index === segments.length - 1

    if (segment === 'edit' || segment === 'create') return

    const isResourceId = !!segment.match(/^[a-z0-9]{20,}$/i)

    let label = getRouteLabel(segment, currentPath)
    let href = `/admin/${currentPath}`
    let shouldBeClickable = !isLast

    if (isResourceId) {
      label = resourceTitle || (segment.substring(0, 8) + '...')
      shouldBeClickable = false
    }

    breadcrumbs.push({
      label,
      href: shouldBeClickable ? href : '#',
      isCurrentPage: isLast || isResourceId,
    })
  })

  return breadcrumbs
}

export function AdminBreadcrumbs() {
  const pathname = usePathname()
  const { resourceTitle } = useResource()
  const breadcrumbs = generateBreadcrumbs(pathname, resourceTitle)

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/admin">Admin</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbs.map((item, index) => (
          <Fragment key={item.href}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {item.isCurrentPage ? (
                <BreadcrumbPage className="max-w-[200px] truncate">
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
