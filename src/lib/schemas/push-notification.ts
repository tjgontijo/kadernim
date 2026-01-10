import { z } from 'zod';

/**
 * Schema para as chaves de criptografia da Push Subscription
 */
export const PushSubscriptionKeysSchema = z.object({
  p256dh: z.string().min(1, 'Chave p256dh é obrigatória'),
  auth: z.string().min(1, 'Chave auth é obrigatória'),
});

/**
 * Schema para criar uma Push Subscription
 */
export const PushSubscriptionCreateSchema = z.object({
  endpoint: z
    .string()
    .url('Endpoint deve ser uma URL válida')
    .min(1, 'Endpoint é obrigatório'),
  keys: PushSubscriptionKeysSchema,
});

/**
 * Schema para cancelar subscription
 */
export const UnsubscribePushSchema = z.object({
  endpoint: z.string().url('Endpoint deve ser uma URL válida'),
});

/**
 * Schema para payload de notificação push
 */
export const PushPayloadSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  url: z.string().optional(),
  tag: z.string().optional(),
  icon: z.string().optional(),
  badge: z.string().optional(),
  image: z.string().optional(),
});

// Types exportados
export type PushSubscriptionKeys = z.infer<typeof PushSubscriptionKeysSchema>;
export type PushSubscriptionCreate = z.infer<typeof PushSubscriptionCreateSchema>;
export type UnsubscribePush = z.infer<typeof UnsubscribePushSchema>;
export type PushPayload = z.infer<typeof PushPayloadSchema>;
