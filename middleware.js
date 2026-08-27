import { NextResponse } from 'next/server';
import { STAFF_COOKIE_NAME, getExpectedSessionValue } from '@/lib/auth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isProtected = pathname.startsWith('/dashboard') && pathname !== '/dashboard/login';

  if (isProtected) {
    const cookieValue = request.cookies.get(STAFF_COOKIE_NAME)?.value;
    const expected = await getExpectedSessionValue();

    if (!cookieValue || cookieValue !== expected) {
      const loginUrl = new URL('/dashboard/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
