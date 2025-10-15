// src/app/(dashboard)/resources/page.tsx
import { ResourcesClient } from '@/components/resources/ResourcesClient';
import { PageHeader } from '@/components/layout/PageHeader';
import { BookOpen } from 'lucide-react';
import { AdSlot } from '@/components/ads';

// 🚀 HABILITAR CACHE para melhor performance
export const dynamic = 'auto'
export const revalidate = 300 // 5 minutos

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
