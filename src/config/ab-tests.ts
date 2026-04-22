export const AB_TEST_CONFIG = {
  enabled: true,
  variants: {
    v1: { path: '/', label: 'Original' },
    v2: { path: '/plans2', label: 'Alternative Design' },
    v3: { path: '/plans3', label: 'Premium Landing' }
  },
  defaultVariant: 'v3' as const,
  cookieName: 'hp_variant',
  cookieMaxAge: 60 * 60 * 24 * 30 // 30 days
};

export type MarketingVariant = keyof typeof AB_TEST_CONFIG.variants;
