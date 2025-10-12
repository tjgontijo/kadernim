import { ProfileClient } from '@/components/profile/ProfileClient';

// Desabilitar cache
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function ProfilePage() {
  return <ProfileClient />;
}
