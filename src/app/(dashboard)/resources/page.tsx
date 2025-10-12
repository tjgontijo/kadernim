import { ResourcesClient } from '@/components/resources/ResourcesClient';
import { PageHeader } from '@/components/layout/PageHeader';
import { BookOpen } from 'lucide-react';
import { AdSlot } from '@/components/ads';

// Desabilitar cache para garantir dados atualizados
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function Dashboard() {
  return (
    <>
      <PageHeader 
        title="Meus Recursos"
        icon={<BookOpen className="h-5 w-5" />}
      />
      
      
      <div className="container mx-auto px-4 py-4">
        <AdSlot slot="header" variant="compact" />
        <ResourcesClient />
      </div>
    </>
  );
}
