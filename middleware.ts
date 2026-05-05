import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const existing = request.cookies.get('ab_hero')
  if (existing && (existing.value === 'A' || existing.value === 'B')) {
    return NextResponse.next()
  }

  const variant: 'A' | 'B' = Math.random() < 0.5 ? 'A' : 'B'

  request.cookies.set('ab_hero', variant)

  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  response.cookies.set('ab_hero', variant, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  })

  return response
}

export const config = {
  matcher: '/',
}
