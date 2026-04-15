'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export function useCheckoutToken() {
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) return

    setIsProcessing(true)

    const verifyToken = async () => {
      try {
        const response = await fetch('/api/v1/auth/verify-checkout-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        if (response.ok) {
          // Token was verified and session created
          // Remove token from URL
          const newUrl = window.location.pathname + window.location.search.replace(/[?&]token=[^&]*/, '').replace(/\?$/, '')
          window.history.replaceState({}, '', newUrl)

          // Reload the page to reflect the authenticated state
          // This ensures the session is fully propagated
          window.location.reload()
        }
      } catch (error) {
        console.error('Erro ao verificar token de checkout:', error)
      } finally {
        setIsProcessing(false)
      }
    }

    verifyToken()
  }, [searchParams])

  return { isProcessing }
}
