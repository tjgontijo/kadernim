// src/lib/auth/auth-client.ts
import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"
import { organizationClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_BASE_URL ??
    (typeof window !== "undefined" ? window.location.origin : undefined),

  basePath: "/api/v1/auth", // <-- adiciona isso aqui

  plugins: [
    adminClient(),
    organizationClient(),
  ],
})

// Exporta os hooks e funções do authClient
export const { useSession, signOut, changePassword } = authClient
