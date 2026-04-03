import { prisma } from '@/lib/db'
import { AuditActor } from '@db'

export interface BillingAuditLogParams {
    userId?: string
    actor: AuditActor
    action: string
    entity: string
    entityId: string
    asaasEventId?: string
    asaasPaymentId?: string
    previousState?: Record<string, unknown>
    newState?: Record<string, unknown>
    metadata?: Record<string, unknown>
}

/**
 * Service to handle all financial audit logs.
 * Every billing related mutation should be logged here.
 */
export class BillingAuditService {
    /**
     * Records a new audit log entry
     */
    static async log(params: BillingAuditLogParams) {
        try {
            return await prisma.billingAuditLog.create({
                data: {
                    ...params,
                    previousState: params.previousState as any,
                    newState: params.newState as any,
                    metadata: params.metadata as any,
                },
            })
        } catch (error) {
            console.error('[BillingAuditService:CRITICAL] Failed to write audit log', error, params)
            // We don't throw here to avoid breaking the main operation, 
            // but in a production environment with strict regulatory requirements, we might want to throw.
        }
    }

    /**
     * Checks if an event from Asaas has already been processed (Idempotency)
     */
    static async isDuplicate(asaasEventId: string): Promise<boolean> {
        const existing = await prisma.billingAuditLog.findUnique({
            where: { asaasEventId },
        })
        return !!existing
    }

    /**
     * Retrieves audit history for a specific entity or user
     */
    static async getTimeline(params: {
        userId?: string
        entity?: string
        entityId?: string
        limit?: number
    }) {
        return prisma.billingAuditLog.findMany({
            where: {
                ...(params.userId && { userId: params.userId }),
                ...(params.entity && { entity: params.entity }),
                ...(params.entityId && { entityId: params.entityId }),
            },
            orderBy: { createdAt: 'desc' },
            take: params.limit || 50,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    }
                }
            }
        })
    }
}
