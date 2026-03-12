import { prisma } from '@/lib/db'
import { normalizeCpfCnpj } from '@/lib/utils/cpf-cnpj'
import { auth } from '@/server/auth/auth'
import { AsaasClient } from './asaas-client'
import { billingLog } from './logger'
import { BillingAuditService } from './audit.service'
import { AuditActor } from '@db'

export interface AsaasCustomer {
    id: string
    name: string
    email: string
    cpfCnpj?: string
    phone?: string
    mobilePhone?: string
    externalReference?: string
}

export class CustomerService {
    /**
     * Ensures that a user exists both locally (Better Auth) and in Asaas.
     * If the user doesn't exist locally, it creates it using auth.api.signUpEmail.
     * If the user doesn't have an asaasCustomerId, it creates one in Asaas and updates the local user.
     */
    static async createOrGetCustomer(params: {
        email: string
        name: string
        cpfCnpj?: string
        phone?: string
    }) {
        const normalizedCpfCnpj = params.cpfCnpj ? normalizeCpfCnpj(params.cpfCnpj) : undefined

        // 1. Check if user exists locally
        let user = await prisma.user.findUnique({
            where: { email: params.email },
            select: { id: true, asaasCustomerId: true, name: true, email: true },
        })

        // 2. Create user with Better Auth if not exists
        if (!user) {
            billingLog('info', 'User not found, creating with Better Auth', { email: params.email })

            try {
                // As it's a server-side call within a service, we're calling the API directly
                // Better Auth's signUpEmail expects a body. 
                // We'll generate a random password to meet the requirement, as users will sign in via OTP later.
                const randomPassword = () => Math.random().toString(36).slice(-12) + 'A1!'

                const result = await (auth.api.signUpEmail as any)({
                    body: {
                        email: params.email,
                        name: params.name,
                        password: randomPassword(),
                    },
                })

                if (!result || !result.user) {
                    throw new Error('Failed to create user with Better Auth')
                }

                user = await prisma.user.findUnique({
                    where: { email: params.email },
                    select: { id: true, asaasCustomerId: true, name: true, email: true },
                })

                if (!user) throw new Error('User creation failed to propagate in database')

                await BillingAuditService.log({
                    userId: user.id,
                    actor: AuditActor.SYSTEM,
                    action: 'USER_CREATED_BETTER_AUTH',
                    entity: 'User',
                    entityId: user.id,
                    metadata: { email: user.email },
                })
            } catch (error: any) {
                billingLog('error', 'Better Auth User Creation Failed', { error: error.message, email: params.email })
                throw error
            }
        }

        // 3. Ensure Asaas Customer exists
        if (!user.asaasCustomerId) {
            billingLog('info', 'Asaas Customer ID missing, creating in Asaas', { userId: user.id })

            try {
                const asaasCustomer = await AsaasClient.post<AsaasCustomer>('/customers', {
                    name: params.name || user.name,
                    email: params.email || user.email,
                    cpfCnpj: normalizedCpfCnpj,
                    phone: params.phone,
                    externalReference: user.id,
                })

                // 4. Update local user with Asaas ID
                await prisma.user.update({
                    where: { id: user.id },
                    data: { asaasCustomerId: asaasCustomer.id },
                })

                await BillingAuditService.log({
                    userId: user.id,
                    actor: AuditActor.SYSTEM,
                    action: 'ASAAS_CUSTOMER_CREATED',
                    entity: 'User',
                    entityId: user.id,
                    newState: { asaasCustomerId: asaasCustomer.id },
                    metadata: { asaasId: asaasCustomer.id },
                })

                return { ...user, asaasCustomerId: asaasCustomer.id }
            } catch (error: any) {
                billingLog('error', 'Asaas Customer Creation Failed', { error: error.message, userId: user.id })
                throw error
            }
        }

        return user
    }

    /**
     * Syncs local details with Asaas.
     * If the customer is not found in Asaas (404), it clears the local asaasCustomerId
     * and recreates the customer to ensure the flow continues.
     */
    static async updateCustomer(userId: string, data: Partial<AsaasCustomer>) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { asaasCustomerId: true, name: true, email: true },
        })

        if (!user?.asaasCustomerId) {
            throw new Error(`User ${userId} does not have an Asaas Customer ID`)
        }

        const normalizedData = {
            ...data,
            cpfCnpj: data.cpfCnpj ? normalizeCpfCnpj(data.cpfCnpj) : data.cpfCnpj,
        }

        try {
            const updated = await AsaasClient.post<AsaasCustomer>(`/customers/${user.asaasCustomerId}`, normalizedData)
            billingLog('info', 'Asaas Customer Updated', { userId, asaasId: user.asaasCustomerId })
            return updated
        } catch (error: any) {
            // If Asaas returns 404, it means the customer was deleted manually there
            if (error.message.includes('[404]')) {
                billingLog('warn', 'Asaas Customer not found (404), clearing local ID and recreating', { userId, oldAsaasId: user.asaasCustomerId })

                // Clear the invalid ID
                await prisma.user.update({
                    where: { id: userId },
                    data: { asaasCustomerId: null }
                })

                // Use existing flow to recreate
                return await this.createOrGetCustomer({
                    email: user.email,
                    name: user.name,
                    cpfCnpj: normalizedData.cpfCnpj,
                    phone: normalizedData.phone || normalizedData.mobilePhone
                })
            }
            throw error
        }
    }
}
