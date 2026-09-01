export function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export async function hashSHA256(value: string): Promise<string> {
  const normalized = value.trim().toLowerCase()
  const encoder = new TextEncoder()
  const data = encoder.encode(normalized)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export type MetaEvent = {
  eventName: string
  eventId: string
  pixelId: string
  contentIds: string[]
  contentName: string
  contentCategory?: string
  contentType: "product"
  value: number
  currency: "BRL"
  numItems?: number
  orderId?: string
}
