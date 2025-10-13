import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"
import { organizationClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL ?? (typeof window !== 'undefined' ? window.location.origin : undefined), 
    plugins: [
        adminClient(),
        organizationClient()
    ]
})

// Exportar hooks e funções do authClient
export const { useSession, signOut, changePassword } = authClient