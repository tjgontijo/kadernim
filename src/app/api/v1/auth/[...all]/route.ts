// src/app/api/auth/[...all]/route.ts
import { auth } from "@/server/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handlers = toNextJsHandler(auth);

export const { GET, POST } = handlers;