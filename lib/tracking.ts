export function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export function getUTMs(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const utms: Record<string, string> = {};
  UTM_KEYS.forEach(key => {
    const val = sessionStorage.getItem(key);
    if (val) utms[key] = val;
  });
  return utms;
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
