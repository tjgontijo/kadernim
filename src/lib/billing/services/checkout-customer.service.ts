import { prisma } from '@/lib/db'
import { CustomerService } from './customer.service'
import { billingLog } from './logger'

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function normalizePhone(phone?: string) {
  if (!phone) return undefined
  const digits = phone.replace(/\D/g, '')
  return digits.length > 0 ? digits : undefined
}

export class CheckoutCustomerService {
  static async resolveGuestCustomer(params: {
    email: string
    name?: string
    phone?: string
    cpfCnpj: string
  }) {
    const email = normalizeEmail(params.email)
    const phone = normalizePhone(params.phone)

    let user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, phone: true },
    })

    if (!user) {
      if (!params.name?.trim()) {
        throw new Error('Nome obrigatório para novo cadastro')
      }

      const createdUser = await CustomerService.createOrGetCustomer({
        email,
        name: params.name.trim(),
        phone,
        cpfCnpj: params.cpfCnpj,
      })

      if (phone) {
        await prisma.user.update({
          where: { id: createdUser.id },
          data: { phone },
        })
      }

      billingLog('info', 'Guest checkout user prepared', {
        userId: createdUser.id,
        email,
      })

      return createdUser
    }

    if (phone && phone !== user.phone) {
      await prisma.user.update({
        where: { id: user.id },
        data: { phone },
      })
    }

    return user
  }

  static async lookupByEmail(email: string) {
    const normalizedEmail = normalizeEmail(email)
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true },
    })

    return {
      exists: Boolean(user),
      name: user?.name ?? null,
    }
  }
}
