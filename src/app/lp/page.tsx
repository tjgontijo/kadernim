import { cookies } from 'next/headers'
import { AB_TEST_CONFIG, MarketingVariant } from '@/config/ab-tests'
import { VariantA } from '@/components/marketing/variants/variant-a'
import { VariantB } from '@/components/marketing/variants/variant-b'
import { VariantC } from '@/components/marketing/variants/variant-c'

export default async function LandingPage() {
  const cookieStore = await cookies()
  const variant = cookieStore.get(AB_TEST_CONFIG.cookieName)?.value as MarketingVariant
  const activeVariant = variant || AB_TEST_CONFIG.defaultVariant

  switch (activeVariant) {
    case 'v1':
      return <VariantA />
    case 'v2':
      return <VariantB />
    case 'v3':
      return <VariantC />
    default:
      return <VariantC />
  }
}
