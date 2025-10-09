import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Le middleware est maintenant simplifié
  // L'authentification est gérée directement dans les routes API et pages
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
