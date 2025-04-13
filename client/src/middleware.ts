import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginRoute = request.nextUrl.pathname === '/auth/login';

  // Se l'utente è sulla pagina di login e ha già un token, reindirizza alla dashboard
  if (isLoginRoute && token) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Se l'utente cerca di accedere a una rotta admin senza token, reindirizza al login
  if (isAdminRoute && !isLoginRoute && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/auth/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 