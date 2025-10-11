import { SettingsClient } from '@/components/settings/SettingsClient';

// Desabilitar cache
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function SettingsPage() {
  return <SettingsClient />;
}
