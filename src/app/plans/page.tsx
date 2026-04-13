import { getBillingCheckoutCatalog } from '@/lib/billing/queries'
import { PlansClient } from './plans-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PlansPage() {
  const catalog = await getBillingCheckoutCatalog(true) // force refresh to ensure DB parity

  return <PlansClient catalog={catalog} />
}
