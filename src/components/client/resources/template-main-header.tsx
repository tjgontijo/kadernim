'use client'

import * as React from 'react'
import { ArrowLeft, LucideIcon } from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/lib/utils/index'
import { Button } from '@/components/ui/button'

type TemplateMainHeaderProps = {
  title?: string
  subtitle?: string
  description?: string
  icon?: LucideIcon
  actions?: React.ReactNode
  children?: React.ReactNode
  className?: string
  backLink?: string
}

export function TemplateMainHeader({
  title,
  subtitle,
  description,
  icon: Icon,
  actions,
  children,
  className,
  backLink,
}: TemplateMainHeaderProps) {
  const headerSubtitle = subtitle || description

  return (
    <div className={cn('flex flex-col border-b border-border bg-background', className)}>
      <div className="flex flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          {backLink && (
            <Button variant="ghost" size="icon" asChild className="-ml-2 h-8 w-8 text-muted-foreground">
              <Link href={backLink}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          )}

          {Icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
          )}

          {(title || headerSubtitle) && (
            <div>
              {title && <h1 className="text-lg font-bold tracking-tight text-foreground">{title}</h1>}
              {headerSubtitle && <p className="text-sm text-muted-foreground">{headerSubtitle}</p>}
            </div>
          )}
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {children && <div className="px-6">{children}</div>}
    </div>
  )
}
