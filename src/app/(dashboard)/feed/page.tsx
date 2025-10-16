import { FeedClient } from '@/components/feed/FeedClient';

// Desabilitar cache
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function FeedPage() {
  return <FeedClient />;
}
