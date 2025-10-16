import { z } from 'zod';

/**
 * Schema para as chaves de criptografia da Push Subscription
 */
export const PushSubscriptionKeysSchema = z.object({
  p256dh: z.string().min(1, 'Chave p256dh é obrigatória'),
  auth: z.string().min(1, 'Chave auth é obrigatória'),
});

/**
 * Schema para criar/atualizar uma Push Subscription
 */
export const PushSubscriptionCreateSchema = z.object({
  endpoint: z
    .string()
    .url('Endpoint deve ser uma URL válida')
    .min(1, 'Endpoint é obrigatório'),
  keys: PushSubscriptionKeysSchema,
});

/**
 * Schema para a resposta da API ao criar subscription
 */
export const PushSubscriptionResponseSchema = z.object({
  id: z.string(),
  success: z.boolean(),
});

/**
 * Schema para enviar uma notificação push
 */
export const SendPushNotificationSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
  body: z.string().min(1, 'Corpo é obrigatório').max(500, 'Corpo muito longo'),
  icon: z.string().url().optional(),
  badge: z.string().url().optional(),
  image: z.string().url().optional(),
  type: z.string().optional(),
  category: z.string().optional(),
  data: z.record(z.string(), z.any()).optional(),
  tag: z.string().optional(),
  requireInteraction: z.boolean().optional(),
  vibrate: z.array(z.number()).optional(),
  actions: z
    .array(
      z.object({
        action: z.string(),
        title: z.string(),
        icon: z.string().url().optional(),
      })
    )
    .optional(),
});

/**
 * Schema para cancelar subscription
 */
export const UnsubscribePushSchema = z.object({
  endpoint: z.string().url('Endpoint deve ser uma URL válida'),
});

/**
 * Schema para a subscription completa (do navegador)
 */
export const BrowserPushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  expirationTime: z.number().nullable().optional(),
  keys: PushSubscriptionKeysSchema,
});

// Types exportados
export type PushSubscriptionKeys = z.infer<typeof PushSubscriptionKeysSchema>;
export type PushSubscriptionCreate = z.infer<typeof PushSubscriptionCreateSchema>;
export type PushSubscriptionResponse = z.infer<typeof PushSubscriptionResponseSchema>;
export type SendPushNotification = z.infer<typeof SendPushNotificationSchema>;
export type UnsubscribePush = z.infer<typeof UnsubscribePushSchema>;
export type BrowserPushSubscription = z.infer<typeof BrowserPushSubscriptionSchema>;
