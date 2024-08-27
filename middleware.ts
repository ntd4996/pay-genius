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

  if (publicPaths && token) {
    return NextResponse.redirect(new URL('/split-the-bill', request.nextUrl));
  }
  if (!token && !publicPaths) {
    return NextResponse.redirect(new URL(`/`, request.nextUrl));
  }
}

export const config = {
  matcher: ['/', '/split-the-bill/:path*', '/create-qr', '/split-the-bill'],
};
