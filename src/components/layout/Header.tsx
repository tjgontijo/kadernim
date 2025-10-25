// src/components/layout/Header.tsx

'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Crown } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { getPageConfig } from '@/lib/page-config';
import { useSession } from '@/lib/auth/auth-client';
import { isAdmin } from '@/lib/auth/roles';
import { UserRoleType } from '@/types/user-role';
import Image from 'next/image';

type UserWithAdditionalFields = {
  name: string;
  email: string;
  whatsapp?: string;
  role?: string;
  subscriptionTier?: string;
};

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const config = getPageConfig(pathname)
  const { data: session } = useSession()
  
  const user = session?.user as UserWithAdditionalFields | undefined
  const userIsAdmin = isAdmin(user?.role as UserRoleType)
  const isPremium = user?.subscriptionTier === 'premium' || userIsAdmin

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
          <Image src="/images/system/logo_transparent.png" alt="Logo" width={40} height={40} priority />
          <h1 className="text-lg font-semibold truncate">{config.title}</h1>         
        </div>
        
        {/* Badge Premium/Admin */}
        {isPremium && (
          <Badge 
            variant="default" 
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 flex-shrink-0"
          >
            <Crown className="h-3 w-3 mr-1" />
            {userIsAdmin ? 'Admin' : 'Premium'}
          </Badge>
        )}
      </div>
    </header>    
  );
}
