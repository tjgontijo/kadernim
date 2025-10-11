import { ResourcesClient } from '@/components/resources/ResourcesClient';

// Desabilitar cache para garantir dados atualizados
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4 mt-6">Recursos Pedagógicos</h1>
      <ResourcesClient />
    </div>
  );
}
