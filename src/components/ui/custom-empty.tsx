import React from 'react'
import { cn } from '@/lib/utils'
import { 
  Empty, 
  EmptyHeader, 
  EmptyTitle, 
  EmptyDescription, 
  EmptyMedia 
} from './empty'

interface CustomEmptyProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function CustomEmpty({
  icon,
  title,
  description,
  action,
  className,
}: CustomEmptyProps) {
  return (
    <Empty className={cn('border rounded-lg', className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action && <div className="mt-4">{action}</div>}
    </Empty>
  )
}
