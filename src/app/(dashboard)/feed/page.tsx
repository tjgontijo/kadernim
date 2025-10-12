import { AdSlot } from '@/components/ads';
import { FeedClient } from '@/components/feed/FeedClient';
import { PageHeader } from '@/components/layout/PageHeader';
import { BookOpen } from 'lucide-react';

// Desabilitar cache
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function FeedPage() {
  return (
    <>
      <PageHeader 
      title="Feed" 
      icon={<BookOpen className="h-5 w-5" />} 
      />      
      <div className="px-4 pb-3 pt-0">
        <AdSlot slot="header" variant="compact" />
      </div>
      
      <div className="container mx-auto px-4 py-4">
        <FeedClient />
      </div>
    </>
  );
}
