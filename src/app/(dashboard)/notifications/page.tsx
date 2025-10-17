// src/app/(dashboard)/notifications/page.tsx

import { NotificationsClient } from '@/components/notifications/NotificationsClient'

// ISR - Cache com revalidação rápida
export const dynamic = 'auto'
export const revalidate = 30 // Cache por 30 segundos

export default function NotificationsPage() {
  return <NotificationsClient />
}
