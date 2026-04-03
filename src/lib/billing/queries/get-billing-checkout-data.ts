import { BillingCatalogService } from '@/lib/billing/services/catalog.service'

export async function getBillingCheckoutCatalog(forceRefresh = false) {
  return BillingCatalogService.getCheckoutCatalog(forceRefresh)
}

