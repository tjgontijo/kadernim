import { Settings } from '@/components/settings/Settings';

// Desabilitar cache
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function SettingsPage() {
  return <Settings />;
}
