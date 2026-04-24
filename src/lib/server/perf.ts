import { dev } from '$app/environment'

const encoder = new TextEncoder()

function round(ms: number) {
  return Number(ms.toFixed(1))
}

export function perfNow() {
  return performance.now()
}

export function perfMs(start: number) {
  return round(performance.now() - start)
}

export function payloadBytes(value: unknown) {
  try {
    return encoder.encode(JSON.stringify(value)).length
  } catch {
    return null
  }
}

export function perfLog(scope: string, details: Record<string, unknown>) {
  if (!dev) return
  console.log(`[perf] ${scope} ${JSON.stringify(details)}`)
}

export function perfError(error: unknown) {
  if (error instanceof Error) return error.message
  return String(error)
}
