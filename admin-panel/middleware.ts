import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';

  // Allow access to public static assets and logo
  if (request.nextUrl.pathname.startsWith('/logo') || 
      request.nextUrl.pathname.startsWith('/_next') || 
      request.nextUrl.pathname.startsWith('/api') ||
      request.nextUrl.pathname.startsWith('/user-policy') ||
      request.nextUrl.pathname.startsWith('/driver-policy') ||
      request.nextUrl.pathname.startsWith('/account-deletion')) {
    return NextResponse.next();
  }

  // If no token and not on login page, redirect to login
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If logged in and trying to access login page, redirect to dashboard
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.jpeg (logo file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.jpeg|user-policy|driver-policy|account-deletion).*)',
  ],
};
