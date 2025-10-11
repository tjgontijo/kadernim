// src/app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

console.log('Configurando rotas de API para Better Auth');

const handlers = toNextJsHandler(auth);
console.log('Handlers de API configurados:', Object.keys(handlers));

export const { GET, POST } = handlers;