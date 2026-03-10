import {
    SubscriptionStatus,
    PaymentMethod,
    InvoiceStatus,
    SplitType,
    AuditActor
} from '@db'

export {
    SubscriptionStatus,
    PaymentMethod,
    InvoiceStatus,
    SplitType,
    AuditActor
}

export interface BillingCustomer {
    id: string
    name: string
    email: string
    phone?: string
    mobilePhone?: string
    cpfCnpj?: string
    asaasCustomerId?: string
    externalReference?: string
}

export interface BillingInvoice {
    id: string
    userId: string
    subscriptionId?: string
    asaasId: string
    status: InvoiceStatus
    paymentMethod: PaymentMethod
    value: number
    netValue?: number
    description?: string
    billingType: string
    dueDate: Date
    paidAt?: Date
    refundedAt?: Date
    invoiceUrl?: string
    bankSlipUrl?: string
    pixQrCode?: string
    createdAt: Date
    updatedAt: Date
}

export interface BillingSubscription {
    id: string
    userId: string
    asaasId?: string
    status: SubscriptionStatus
    paymentMethod?: PaymentMethod
    pixAutomaticAuthId?: string
    isActive: boolean
    purchaseDate: Date
    expiresAt?: Date
    canceledAt?: Date
    createdAt: Date
    updatedAt: Date
}

export interface SplitConfig {
    id: string
    companyName: string
    cnpj: string
    walletId: string
    isActive: boolean
    splitType: SplitType
    percentualValue?: number
    fixedValue?: number
    description?: string
    createdAt: Date
    updatedAt: Date
}

export interface BillingAuditLog {
    id: string
    userId?: string
    actor: AuditActor
    action: string
    entity: string
    entityId: string
    asaasEventId?: string
    asaasPaymentId?: string
    previousState?: any
    newState?: any
    metadata?: any
    createdAt: Date
}
