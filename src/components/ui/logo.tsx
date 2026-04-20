'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/index'

interface LogoProps {
  className?: string
  href?: string
  showText?: boolean
  textColor?: string
  iconBg?: string
}

export function Logo({ 
  className, 
  href = '/', 
  showText = true, 
  textColor = 'text-ink',
  iconBg = 'bg-ink'
}: LogoProps) {
  return (
    <Link href={href} className={cn("flex items-center gap-[12px]", className)}>
      <div className={cn("relative w-[34px] h-[34px] rounded-[10px] text-white flex items-center justify-center font-display font-semibold text-[18px] after:absolute after:-top-[2px] after:-right-[2px] after:w-[8px] after:h-[8px] after:rounded-full after:bg-mustard shrink-0 shadow-1 border border-transparent", iconBg)}>
        K
      </div>
      {showText && (
        <div className="overflow-hidden">
          <div className={cn("font-display font-semibold text-[20px] tracking-[-0.02em] leading-none whitespace-nowrap", textColor)}>
            Kadernim
          </div>
          <div className="font-hand text-[15px] text-terracotta leading-none mt-1 whitespace-nowrap">
            de professora p/ professora
          </div>
        </div>
      )}
    </Link>
  )
}
