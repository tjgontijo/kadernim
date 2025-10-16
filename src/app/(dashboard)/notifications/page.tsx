// src/app/(dashboard)/notifications/page.tsx

import { NotificationsClient } from '@/components/notifications/NotificationsClient'

// Desabilitar cache
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function NotificationsPage() {
  return <NotificationsClient />
}
