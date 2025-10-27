import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook/clerk',
  '/suspended',
  '/api/inngest',
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, sessionClaims } = await auth();

  if (userId) {
    const userStatus = sessionClaims?.metadata?.status as string | undefined;
    const isSuspendedOrBanned =
      userStatus === 'SUSPENDED' || userStatus === 'BANNED';
    const isTryingToAccessSuspendedPage =
      req.nextUrl.pathname.startsWith('/suspended');

    if (isSuspendedOrBanned && !isTryingToAccessSuspendedPage) {
      return NextResponse.redirect(new URL('/suspended', req.url));
    }

    if (!isSuspendedOrBanned && isTryingToAccessSuspendedPage) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    if (isPublicRoute(req) && !isTryingToAccessSuspendedPage) {
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
