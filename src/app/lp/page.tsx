import { cookies } from 'next/headers'
import { AB_TEST_CONFIG, MarketingVariant } from '@/config/ab-tests'
import { VariantA } from '@/components/marketing/variants/variant-a'
import { VariantB } from '@/components/marketing/variants/variant-b'
import { VariantC } from '@/components/marketing/variants/variant-c'
import { getFeaturedResources } from '@/lib/marketing/product-data'

export default async function LandingPage() {
  const [cookieStore, products] = await Promise.all([
    cookies(),
    getFeaturedResources()
  ])
  
  const variant = cookieStore.get(AB_TEST_CONFIG.cookieName)?.value as MarketingVariant
  const activeVariant = variant || AB_TEST_CONFIG.defaultVariant

  switch (activeVariant) {
    case 'v1':
      return <VariantA products={products} />
    case 'v2':
      return <VariantB products={products} />
    case 'v3':
      return <VariantC products={products} />
    default:
      return <VariantC products={products} />
  }
}
