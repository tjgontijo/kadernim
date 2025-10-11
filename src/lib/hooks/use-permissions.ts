import { useEffect, useState } from 'react'
import { authClient } from '@/lib/auth/auth-client'

interface UsePermissionsOptions {
  required?: string[]
  requiredRoles?: string[]
  redirectTo?: string
}

export function usePermissions(options: UsePermissionsOptions = {}) {
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [userRoles, setUserRoles] = useState<string[]>([])
  const [userPermissions, setUserPermissions] = useState<string[]>([])

  useEffect(() => {
    async function checkPermissions() {
      try {
        // Verificar se o usuário está autenticado
        const session = await authClient.getSession()
        
        if (!session || !session.data?.user) {
          if (options.redirectTo) {
            window.location.href = options.redirectTo
            return
          }
          setHasAccess(false)
          setLoading(false)
          return
        }

        // Buscar papéis e permissões do usuário
        const response = await fetch('/api/auth/permissions', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          setHasAccess(false)
          setLoading(false)
          return
        }

        const data = await response.json()
        const roles = data.roles.map((role: { name: string }) => role.name)
        const permissions = data.permissions.map((permission: { name: string }) => permission.name)

        setUserRoles(roles)
        setUserPermissions(permissions)

        // Verificar se o usuário tem os papéis necessários
        if (options.requiredRoles && options.requiredRoles.length > 0) {
          const hasRequiredRoles = options.requiredRoles.some(role => roles.includes(role))
          if (!hasRequiredRoles) {
            setHasAccess(false)
            setLoading(false)
            if (options.redirectTo) {
              window.location.href = options.redirectTo
            }
            return
          }
        }

        // Verificar se o usuário tem as permissões necessárias
        if (options.required && options.required.length > 0) {
          const hasRequiredPermissions = options.required.some(permission => 
            permissions.includes(permission)
          )
          if (!hasRequiredPermissions) {
            setHasAccess(false)
            setLoading(false)
            if (options.redirectTo) {
              window.location.href = options.redirectTo
            }
            return
          }
        }

        setHasAccess(true)
        setLoading(false)
      } catch (error) {
        console.error('Erro ao verificar permissões:', error)
        setHasAccess(false)
        setLoading(false)
      }
    }

    checkPermissions()
  }, [options.required, options.requiredRoles, options.redirectTo])

  return {
    loading,
    hasAccess,
    userRoles,
    userPermissions,
    hasPermission: (permission: string) => userPermissions.includes(permission),
    hasRole: (role: string) => userRoles.includes(role),
  }
}
