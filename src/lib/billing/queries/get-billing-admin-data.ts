import { BillingAdminService } from '@/lib/billing/services/admin.service'

export async function getBillingOverviewData() {
  return BillingAdminService.getOverviewData()
}

export async function getBillingAuditData(limit?: number) {
  return BillingAdminService.getAuditPageData(limit)
}

export async function getBillingSplitData() {
  return BillingAdminService.getSplitPageData()
}
