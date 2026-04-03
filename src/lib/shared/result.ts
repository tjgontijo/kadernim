export type Result<T, E extends string = string> =
  | { success: true; data: T }
  | { success: false; error: E }

export function ok<T, E extends string = string>(data: T): Result<T, E> {
  return { success: true, data }
}

export function fail<E extends string>(error: E): Result<never, E> {
  return { success: false, error }
}
