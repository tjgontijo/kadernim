import { Metadata } from 'next'
import { headers } from 'next/headers'
import { auth } from '@/server/auth/auth'
import { GuestCheckoutForm } from '@/components/dashboard/billing/checkout-form'
import { BillingCatalogService } from '@/services/billing/catalog.service'
import { BookOpen, Lock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Checkout | Kadernim Pro',
  description: 'Adquira agora o Kadernim Pro.',
}

export default async function CheckoutPage() {
  let prefilledUser: { id: string; name: string; email: string } | null = null
  const catalog = await BillingCatalogService.getCheckoutCatalog()

  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (session?.user) {
      prefilledUser = {
        id: session.user.id,
        name: session.user.name || '',
        email: session.user.email,
      }
    }
  } catch {
    // guest checkout
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 sm:px-8">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="font-bold text-gray-900 text-base">Kadernim</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-gray-400">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="text-xs font-medium">Compra segura</span>
        </div>
      </header>

      <main className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <GuestCheckoutForm prefilledUser={prefilledUser} catalog={catalog} />
      </main>
    </div>
  )
}
