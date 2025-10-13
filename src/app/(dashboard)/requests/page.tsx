import { PageHeader } from '@/components/layout/PageHeader';
import { BookOpen } from 'lucide-react';

// Desabilitar cache
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function RequestPage() {
  return (
    <>
      <PageHeader 
      title="Feed" 
      icon={<BookOpen className="h-5 w-5" />} 
      />      
      <div className="container mx-auto px-4 py-4">
        <p>Requests</p>
      </div>
    </>
  );
}
