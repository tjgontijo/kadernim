import { prisma } from '@/lib/db'
import type { AutomationRuleInput } from '@/schemas/automations/automation-schemas'

export class AutomationService {
    static async list() {
        return prisma.automationRule.findMany({
            include: {
                actions: true,
                _count: { select: { logs: true } },
            },
            orderBy: { createdAt: 'desc' },
        })
    }

    static async create(data: AutomationRuleInput) {
        return prisma.automationRule.create({
            data: {
                name: data.name,
                eventType: data.eventType,
                description: data.description,
                isActive: data.isActive,
                conditions: data.conditions as any,
                actions: {
                    create: data.actions.map((action, index) => ({
                        type: action.type,
                        config: action.config as any,
                        order: action.order ?? index,
                    })),
                },
            },
            include: { actions: true },
        })
    }

    static async getById(id: string) {
        return prisma.automationRule.findUnique({
            where: { id },
            include: { actions: true },
        })
    }

    static async update(id: string, data: any) {
        return prisma.automationRule.update({
            where: { id },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.isActive !== undefined && { isActive: data.isActive }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.eventType !== undefined && { eventType: data.eventType }),
                ...(data.conditions !== undefined && { conditions: data.conditions }),
                ...(data.actions !== undefined && {
                    actions: {
                        deleteMany: {},
                        create: data.actions.map((action: any, index: number) => ({
                            type: action.type,
                            config: action.config,
                            order: action.order ?? index,
                        })),
                    },
                }),
            },
            include: { actions: true },
        })
    }

    static async delete(id: string) {
        // Deletar logs primeiro (não tem cascade)
        await prisma.automationLog.deleteMany({ where: { ruleId: id } });

        // Deletar actions (cascade deveria funcionar, mas por segurança)
        await prisma.automationAction.deleteMany({ where: { ruleId: id } });

        // Agora deleta a regra
        return prisma.automationRule.delete({ where: { id } });
    }

    static async getLogs(params: { page?: number; limit?: number; ruleId?: string }) {
        const page = params.page || 1
        const limit = params.limit || 20
        const where = params.ruleId ? { ruleId: params.ruleId } : {}

        const [logs, total] = await Promise.all([
            prisma.automationLog.findMany({
                where,
                include: { rule: true },
                orderBy: { executedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.automationLog.count({ where }),
        ])

        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    }
}
