import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const PIXEL_ID = "556311680458005"
const CAPI_URL = `https://graph.facebook.com/v25.0/${PIXEL_ID}/events`

function hash(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex")
}

function hashIfPresent(value: unknown): string | undefined {
  if (!value || typeof value !== "string") return undefined
  return hash(value)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_name, event_id, event_source_url, user_data = {}, custom_data = {} } = body

    if (!event_name || !event_id) {
      return NextResponse.json({ error: "Missing event_name or event_id" }, { status: 400 })
    }

    const token = process.env.META_CAPI_ACCESS_TOKEN
    if (!token) {
      return NextResponse.json({ error: "CAPI token not configured" }, { status: 500 })
    }

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined
    const clientUserAgent = request.headers.get("user-agent") || undefined

    const userData: Record<string, string> = {}
    if (hashIfPresent(user_data.em)) userData.em = hashIfPresent(user_data.em)!
    if (hashIfPresent(user_data.ph)) userData.ph = hashIfPresent(user_data.ph)!
    if (hashIfPresent(user_data.fn)) userData.fn = hashIfPresent(user_data.fn)!
    if (hashIfPresent(user_data.ln)) userData.ln = hashIfPresent(user_data.ln)!
    if (hashIfPresent(user_data.ct)) userData.ct = hashIfPresent(user_data.ct)!
    if (hashIfPresent(user_data.st)) userData.st = hashIfPresent(user_data.st)!
    if (hashIfPresent(user_data.zp)) userData.zp = hashIfPresent(user_data.zp)!
    if (user_data.external_id) userData.external_id = user_data.external_id
    if (user_data.fbp) userData.fbp = user_data.fbp
    if (user_data.fbc) userData.fbc = user_data.fbc
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

    const response = await fetch(`${CAPI_URL}?access_token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [eventPayload] }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("Meta CAPI error:", result)
      return NextResponse.json({ error: "CAPI request failed", detail: result }, { status: 502 })
    }

    return NextResponse.json({ success: true, events_received: result.events_received })
  } catch (err) {
    console.error("CAPI route error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
