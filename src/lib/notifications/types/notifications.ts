import type {
  PushPayload,
  PushSubscriptionCreate,
  TestPushRequest,
  UnsubscribePush,
} from '@/lib/notifications/schemas'

export type {
  PushPayload,
  PushSubscriptionCreate,
  TestPushRequest,
  UnsubscribePush,
}

export interface AudienceFilter {
  roles?: string[]
  hasSubscription?: 'all' | 'subscribers' | 'non-subscribers'
  activeInDays?: number | null
  inactiveForDays?: number | null
}
