// src/lib/helpers/password.ts
export function randomPassword(): string {
  const rand = Math.random().toString(36).slice(-6)
  const upper = String.fromCharCode(65 + Math.floor(Math.random() * 26))
  const num = Math.floor(Math.random() * 10).toString()
  return `${upper}${rand}${num}`
}
