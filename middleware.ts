import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Récupérer le token de session depuis les cookies
  const token = request.cookies.get('sb-access-token')?.value ||
                request.cookies.get('sb-lytalbwasjtohwzpenxz-auth-token')?.value

  // Routes protégées
  const protectedRoutes = ['/dashboard', '/api/generate', '/api/delete']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Routes d'authentification
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.includes(pathname)

  // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une route protégée
  if (isProtectedRoute && !token) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Si l'utilisateur est authentifié et essaie d'accéder aux pages de connexion/inscription
  if (isAuthRoute && token) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/generate/:path*', '/api/delete/:path*', '/login', '/signup'],
}
