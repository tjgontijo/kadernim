import { FeedClient } from '@/components/feed/FeedClient';

// ISR - Cache com revalidação
export const dynamic = 'auto'
export const revalidate = 60 // Cache por 60 segundos

export default function FeedPage() {
  return <FeedClient />;
}
