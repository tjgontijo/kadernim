// src/app/(dashboard)/resources/page.tsx
import { ResourcesClient } from '@/components/resources/ResourcesClient';
import { AdSlot } from '@/components/ads';

// 🚀 HABILITAR CACHE para melhor performance
export const dynamic = 'auto'
export const revalidate = 300 // 5 minutos

export default function Dashboard() {
  return (
    <>
      <AdSlot slot="header" variant="compact" />
      <ResourcesClient />
    </>
  );
}
