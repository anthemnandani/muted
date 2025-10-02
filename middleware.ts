import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export default authMiddleware({
  publicRoutes: ['/api/webhooks/clerk'],
  afterAuth(auth, req) {
    if (auth.userId && req.nextUrl.pathname.startsWith('/admin')) {
      const userRole = auth.sessionClaims?.publicMetadata?.role;

      if (userRole !== 'ADMIN') {
        const homeUrl = new URL('/', req.url);
        return NextResponse.redirect(homeUrl);
      }
    }
    return NextResponse.next();
  },
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
