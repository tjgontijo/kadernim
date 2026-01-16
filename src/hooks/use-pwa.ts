'use client'

import { useState, useEffect, useCallback } from 'react'

interface AppVersion {
  version: string
  buildAt: string
}

interface UsePwaReturn {
  version: AppVersion | null
  isLoading: boolean
  isPwa: boolean
  hasUpdate: boolean
  isUpdating: boolean
  checkForUpdate: () => Promise<boolean>
  applyUpdate: () => void
  clearCache: () => Promise<void>
  isClearing: boolean
}

export function usePwa(): UsePwaReturn {
  const [version, setVersion] = useState<AppVersion | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPwa, setIsPwa] = useState(false)
  const [hasUpdate, setHasUpdate] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  // Load version and check PWA status
  useEffect(() => {
    const loadVersion = async () => {
      try {
        const res = await fetch('/version.json')
        const data = await res.json()
        setVersion(data)
      } catch {
        console.error('[PWA] Error loading version')
      } finally {
        setIsLoading(false)
      }
    }

    // Check if running as PWA
    const checkPwaStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isIosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true
      setIsPwa(isStandalone || isIosStandalone)
    }

    loadVersion()
    checkPwaStatus()

    // Get SW registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        setRegistration(reg)
        // Check if there's already a waiting worker
        if (reg.waiting) {
          setHasUpdate(true)
        }
      })

      // Listen for new updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (isUpdating) {
          window.location.reload()
        }
      })
    }
  }, [isUpdating])

  // Check for updates manually
  const checkForUpdate = useCallback(async (): Promise<boolean> => {
    if (!registration) return false

    try {
      await registration.update()

      // Small delay to let the update process
      await new Promise(resolve => setTimeout(resolve, 500))

      if (registration.waiting) {
        setHasUpdate(true)
        return true
      }

      return false
    } catch (error) {
      console.error('[PWA] Error checking for update:', error)
      return false
    }
  }, [registration])

  // Apply pending update
  const applyUpdate = useCallback(() => {
    if (!registration?.waiting) return

    setIsUpdating(true)
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }, [registration])

  // Clear all caches
  const clearCache = useCallback(async (): Promise<void> => {
    setIsClearing(true)

    try {
      // Clear Cache API caches
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        )
      }

      // Unregister service worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(
          registrations.map(reg => reg.unregister())
        )
      }

      // Clear localStorage (except auth-related items)
      const authKeys = ['auth-token', 'session']
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && !authKeys.some(ak => key.includes(ak))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))

      // Clear sessionStorage
      sessionStorage.clear()

    } catch (error) {
      console.error('[PWA] Error clearing cache:', error)
      throw error
    } finally {
      setIsClearing(false)
    }
  }, [])

  return {
    version,
    isLoading,
    isPwa,
    hasUpdate,
    isUpdating,
    checkForUpdate,
    applyUpdate,
    clearCache,
    isClearing,
  }
}
