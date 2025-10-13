import { PageHeader } from '@/components/layout/PageHeader';
import { ProfileClient } from '@/components/profile/ProfileClient';
import { User } from 'lucide-react';

// Desabilitar cache
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function ProfilePage() {
  return (
    <>  
      <PageHeader 
        title="Perfil" 
        icon={<User className="h-5 w-5" />}        
      />
      <div className="container mx-auto px-4 py-4">
        <ProfileClient />
      </div>
    </>
  );
}
