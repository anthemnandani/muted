import { authMiddleware, redirectToSignIn } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export default authMiddleware({
  publicRoutes: ['/sign-in', '/sign-up', '/api/webhooks/clerk', '/suspended'],

  ignoredRoutes: ['/api/inngest'],

  afterAuth(auth, req) {
    if (auth.userId) {
      const userStatus = auth.sessionClaims?.publicMetadata?.status as
        | string
        | undefined;
      const isSuspendedOrBanned =
        userStatus === 'SUSPENDED' || userStatus === 'BANNED';
      const isTryingToAccessSuspendedPage =
        req.nextUrl.pathname.startsWith('/suspended');

      if (isSuspendedOrBanned && !isTryingToAccessSuspendedPage) {
        const suspendedUrl = new URL('/suspended', req.url);
        return NextResponse.redirect(suspendedUrl);
      }

      if (!isSuspendedOrBanned && isTryingToAccessSuspendedPage) {
        const homeUrl = new URL('/', req.url);
        return NextResponse.redirect(homeUrl);
      }

      if (auth.isPublicRoute) {
        if (!isTryingToAccessSuspendedPage) {
          const homeUrl = new URL('/', req.url);
          return NextResponse.redirect(homeUrl);
        }
      }

      if (req.nextUrl.pathname.startsWith('/admin')) {
        const userRole = auth.sessionClaims?.publicMetadata?.role;
        if (userRole !== 'ADMIN') {
          const homeUrl = new URL('/', req.url);
          return NextResponse.redirect(homeUrl);
        }
      }

      return NextResponse.next();
    }

    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    return NextResponse.next();
  },
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
