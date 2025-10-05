import { authMiddleware, redirectToSignIn } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export default authMiddleware({
  publicRoutes: ['/sign-in', '/sign-up', '/api/webhooks/clerk'],

  afterAuth(auth, req) {
    if (auth.userId) {
      if (auth.isPublicRoute) {
        const homeUrl = new URL('/', req.url);
        return NextResponse.redirect(homeUrl);
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
