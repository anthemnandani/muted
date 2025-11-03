import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook/clerk',
  '/api/inngest',
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, sessionClaims } = await auth();
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  if (userId) {
    const userStatus = sessionClaims?.metadata?.status as string | undefined;
    const isSuspended = userStatus === 'SUSPENDED';
    const isAccessingSuspendedPage = pathname.startsWith('/suspended');

    if (isSuspended && !isAccessingSuspendedPage) {
      return NextResponse.redirect(new URL('/suspended', req.url));
    }

    if (!isSuspended && isAccessingSuspendedPage) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    if (isPublicRoute(req) && !isAccessingSuspendedPage) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    const userRole = sessionClaims?.metadata?.role;
    if (isAdminRoute(req) && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
