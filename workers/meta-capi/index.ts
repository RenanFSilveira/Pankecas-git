const PIXEL_ID = "556311680458005"
const CAPI_URL = `https://graph.facebook.com/v25.0/${PIXEL_ID}/events`

export interface Env {
  META_CAPI_ACCESS_TOKEN: string
}

async function sha256hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value.trim().toLowerCase())
  const buf = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

async function hashField(value: unknown): Promise<string | undefined> {
  if (!value || typeof value !== "string") return undefined
  return sha256hex(value)
}

function corsHeaders(origin: string | null): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  }
}

function json(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin")
    const cors = corsHeaders(origin)

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors })
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, cors)
    }

    try {
      const body = (await request.json()) as {
        event_name?: string
        event_id?: string
        event_source_url?: string
        user_data?: Record<string, unknown>
        custom_data?: Record<string, unknown>
      }

      const { event_name, event_id, event_source_url, user_data = {}, custom_data = {} } = body

      if (!event_name || !event_id) {
        return json({ error: "Missing event_name or event_id" }, 400, cors)
      }

      const token = env.META_CAPI_ACCESS_TOKEN
      if (!token) {
        return json({ error: "CAPI token not configured" }, 500, cors)
      }

      // Cloudflare provides the real IP via CF-Connecting-IP
      const clientIp =
        request.headers.get("CF-Connecting-IP") ||
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        undefined
      const clientUserAgent = request.headers.get("user-agent") || undefined

      const [em, ph, fn, ln, ct, st, zp] = await Promise.all([
        hashField(user_data.em),
        hashField(user_data.ph),
        hashField(user_data.fn),
        hashField(user_data.ln),
        hashField(user_data.ct),
        hashField(user_data.st),
        hashField(user_data.zp),
      ])

      const userData: Record<string, string> = {}
      if (em) userData.em = em
      if (ph) userData.ph = ph
      if (fn) userData.fn = fn
      if (ln) userData.ln = ln
      if (ct) userData.ct = ct
      if (st) userData.st = st
      if (zp) userData.zp = zp
      if (typeof user_data.external_id === "string") userData.external_id = user_data.external_id
      if (typeof user_data.fbp === "string") userData.fbp = user_data.fbp
      if (typeof user_data.fbc === "string") userData.fbc = user_data.fbc
      if (clientIp) userData.client_ip_address = clientIp
      if (clientUserAgent) userData.client_user_agent = clientUserAgent

      const eventPayload: Record<string, unknown> = {
        event_name,
        event_id,
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        user_data: userData,
      }
      if (event_source_url) eventPayload.event_source_url = event_source_url
      if (custom_data && Object.keys(custom_data).length > 0) eventPayload.custom_data = custom_data

      const metaResponse = await fetch(`${CAPI_URL}?access_token=${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [eventPayload] }),
      })

      const result = (await metaResponse.json()) as Record<string, unknown>

      if (!metaResponse.ok) {
        console.error("Meta CAPI error:", JSON.stringify(result))
        return json({ error: "CAPI request failed", detail: result }, 502, cors)
      }

      return json({ success: true, events_received: result.events_received }, 200, cors)
    } catch (err) {
      console.error("Worker error:", err)
      return json({ error: "Internal error" }, 500, cors)
    }
  },
}
