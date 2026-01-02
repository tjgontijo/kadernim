'use client'

import { Fragment } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { HeaderActionsSlot } from './header-actions'
import { useResource } from '@/contexts/resource-context'

// Route labels mapping (excluding /admin prefix)
const ROUTE_LABELS: Record<string, string> = {
  '': 'Dashboard',
  'resources': 'Recursos',
  'users': 'Usuários',
  'organizations': 'Organizações',
  'analytics': 'Analytics',
  'settings': 'Configurações',
}

function getRouteLabel(segment: string, fullPath: string): string {
  // Try full path first (for nested routes)
  if (ROUTE_LABELS[fullPath]) {
    return ROUTE_LABELS[fullPath]
  }
  // Fall back to segment
  if (ROUTE_LABELS[segment]) {
    return ROUTE_LABELS[segment]
  }
  // Capitalize first letter as fallback
  return segment.charAt(0).toUpperCase() + segment.slice(1)
}

type BreadcrumbItemData = {
  label: string
  href: string
  isCurrentPage: boolean
}

function generateBreadcrumbs(pathname: string, resourceTitle?: string | null): BreadcrumbItemData[] {
  // Remove /admin prefix and split
  const withoutAdmin = pathname.replace(/^\/admin\/?/, '')

  if (!withoutAdmin) {
    // We're on /admin root
    return [{ label: 'Dashboard', href: '/admin', isCurrentPage: true }]
  }

  const segments = withoutAdmin.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItemData[] = []

  let currentPath = ''

  segments.forEach((segment, index) => {
    currentPath += (currentPath ? '/' : '') + segment
    const isLast = index === segments.length - 1

    // Skip 'edit' breadcrumb
    if (segment === 'edit') {
      return
    }

    // Check if this looks like a resource ID (cuid format)
    const isResourceId = !!segment.match(/^[a-z0-9]{20,}$/i)

    let label = getRouteLabel(segment, currentPath)
    let href = `/admin/${currentPath}`
    let shouldBeClickable = !isLast

    // If it's a resource ID, use the resource title from context if available, otherwise truncate ID
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

export function AdminHeader() {
  const pathname = usePathname()
  const { resourceTitle } = useResource()
  const breadcrumbs = generateBreadcrumbs(pathname, resourceTitle)

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-6 bg-background">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => (
            <Fragment key={item.href}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {item.isCurrentPage ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
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

      <div className="ml-auto flex items-center gap-2">
        <HeaderActionsSlot />
      </div>
    </header>
  )
}
