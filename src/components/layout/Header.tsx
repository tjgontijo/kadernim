// src/components/layout/Header.tsx

'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { getPageConfig } from '@/lib/page-config';

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const config = getPageConfig(pathname)

  const handleBack = () => {
    if (config.backHref) {
      router.push(config.backHref)
    } else {
      router.back()
    }
  }

  return (
    <header className="sticky top-0 z-50 flex flex-col shrink-0 border-b bg-background mb-4">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 flex-1">
          {config.showBack && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBack}
              className="h-9 w-9 rounded-full hover:bg-muted flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Button>
          )}
          <h1 className="text-lg font-semibold truncate">{config.title}</h1>
        </div>
      </div>
    </header>    
  );
}
