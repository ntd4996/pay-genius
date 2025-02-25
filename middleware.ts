import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const publicPaths = path === '/';
  const isAdminPath = path.startsWith('/admin');

  if (publicPaths && token) {
    return NextResponse.redirect(new URL('/split-the-bill', request.nextUrl));
  }

  if (!token && !publicPaths) {
    const currentUrl = request.nextUrl.toString();
    const redirectUrl = new URL('/', request.nextUrl.origin);
    redirectUrl.searchParams.set('currentUrl', currentUrl);
    return NextResponse.redirect(redirectUrl);
  }

  // Kiểm tra quyền admin
  if (isAdminPath && token?.email !== 'ntd4996@gmail.com') {
    return NextResponse.redirect(new URL('/split-the-bill', request.nextUrl));
  }
}

export const config = {
  matcher: [
    '/',
    '/split-the-bill/:path*',
    '/create-qr',
    '/split-the-bill',
    '/unpaid',
    '/admin/:path*'
  ],
};
