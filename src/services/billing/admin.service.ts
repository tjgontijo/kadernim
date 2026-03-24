import { prisma } from '@/lib/db'
import { InvoiceStatus } from '@db'
import type { SplitUpdate } from '@/schemas/billing/split-schemas'
import { BillingAsaasConfigService } from './asaas-config.service'
import { SplitService } from './split.service'
import { BillingWalletService } from './wallet.service'

export class BillingAdminService {
  static async getOverviewData() {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalSubscribers,
      invoicesThisMonth,
      pendingInvoicesCount,
      overdueInvoicesCount,
      recentInvoices,
    ] = await Promise.all([
      prisma.subscription.count({
        where: { isActive: true },
      }),
      prisma.invoice.aggregate({
        where: {
          status: { in: [InvoiceStatus.RECEIVED, InvoiceStatus.CONFIRMED] },
          createdAt: { gte: startOfMonth },
        },
        _sum: { value: true },
        _count: { id: true },
      }),
      prisma.invoice.count({
        where: { status: InvoiceStatus.PENDING },
      }),
      prisma.invoice.count({
        where: { status: InvoiceStatus.OVERDUE },
      }),
      prisma.invoice.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
    ])

    return {
      totalSubscribers,
      grossRevenueThisMonth: invoicesThisMonth._sum.value || 0,
      paidInvoicesThisMonth: invoicesThisMonth._count.id,
      pendingInvoicesCount,
      overdueInvoicesCount,
      recentInvoices,
    }
  }

  static async getAuditPageData(limit = 50) {
    const logs = await prisma.billingAuditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    })

    return { logs }
  }

  static async getIntegrationPageData() {
    return {
      asaasConfig: await BillingAsaasConfigService.getAdminConfig(),
    }
  }

  static async getWalletPageData() {
    const [billingWallet, splitConfig] = await Promise.all([
      BillingWalletService.getConfig(),
      SplitService.getConfig(),
    ])

    return {
      billingWallet,
      hasActiveSplit: !!splitConfig,
    }
  }

  static async getSplitPageData() {
    const [config, mainWalletId] = await Promise.all([
      SplitService.getConfig(),
      BillingWalletService.getMainWalletId(),
    ])

    const initialSplitConfig: SplitUpdate | undefined = config
      ? {
          companyName: config.companyName,
          cnpj: config.cnpj,
          walletId: config.walletId,
          splitType: config.splitType,
          percentualValue: config.percentualValue ?? undefined,
          fixedValue: config.fixedValue ?? undefined,
          description: config.description ?? undefined,
        }
      : undefined

    return {
      initialSplitConfig,
      hasMainWallet: !!mainWalletId,
    }
  }
}
