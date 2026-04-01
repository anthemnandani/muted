// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// const isPublicRoute = createRouteMatcher([
//   '/sign-in(.*)',
//   '/sign-up(.*)',
//   '/api/webhook/clerk',
//   '/api/inngest',
// ]);

// const isAdminRoute = createRouteMatcher(['/admin(.*)']);

// export default clerkMiddleware(async (auth, req: NextRequest) => {
//   const { userId, sessionClaims } = await auth();
//   const { pathname } = req.nextUrl;

//   // ✅ Detect bots (VERY IMPORTANT)
//   const userAgent = req.headers.get('user-agent') || '';
//   const isBot =
//   userAgent.includes('facebookexternalhit') ||
//   userAgent.includes('facebot') ||
//   userAgent.includes('twitterbot') ||
//   userAgent.includes('linkedinbot') ||
//   userAgent.includes('whatsapp') ||
//   userAgent.includes('slackbot') ||
//   userAgent.includes('discordbot');

//   // ✅ Allow bots to access everything (NO redirect)
//   if (isBot) {
//     return NextResponse.next();
//   }

//   // Existing API bypass
//   if (pathname.startsWith('/api')) {
//     return NextResponse.next();
//   }

//   if (userId) {
//     const userStatus = sessionClaims?.metadata?.status as string | undefined;
//     const isSuspended = userStatus === 'SUSPENDED';
//     const isAccessingSuspendedPage = pathname.startsWith('/suspended');

//     if (isSuspended && !isAccessingSuspendedPage) {
//       return NextResponse.redirect(new URL('/suspended', req.url));
//     }

//     if (!isSuspended && isAccessingSuspendedPage) {
//       return NextResponse.redirect(new URL('/', req.url));
//     }

//     if (isPublicRoute(req) && !isAccessingSuspendedPage) {
//       return NextResponse.redirect(new URL('/', req.url));
//     }

//     const userRole = sessionClaims?.metadata?.role;
//     if (isAdminRoute(req) && userRole !== 'ADMIN') {
//       return NextResponse.redirect(new URL('/', req.url));
//     }

//     return NextResponse.next();
//   }

//   // Important: skip protect for bots already handled above
//   if (!isPublicRoute(req)) {
//     await auth.protect();
//   }

//   return NextResponse.next();
// });

// export const config = {
//   matcher: [
//     '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//     '/(api|trpc)(.*)',
//   ],
// };

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

const SOCIAL_CRAWLERS =
  /facebookexternalhit|facebot|twitterbot|linkedinbot|whatsapp|slackbot|telegrambot|discordbot|googlebot|bingbot|Baiduspider|yandex/i;

const isCrawlerAccessibleRoute = createRouteMatcher([
  '/post/(.*)',
  '/thread/(.*)',
  '/@(.*)',
  '/feed/(.*)',
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;

  // 1. Always evaluate auth unconditionally to prepare Clerk headers!
  // This absolutely prevents the "clerkMiddleware() not detected" 500 crash.
  const { userId, sessionClaims } = await auth();

  // Allow API routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // =========================
  // LOGGED-IN USER LOGIC
  // =========================
  if (userId) {
    const userStatus = sessionClaims?.metadata?.status as string | undefined;
    const isSuspended = userStatus === 'SUSPENDED';
    const isAccessingSuspendedPage = pathname.startsWith('/suspended');

    // Suspended handling
    if (isSuspended && !isAccessingSuspendedPage) {
      return NextResponse.redirect(new URL('/suspended', req.url));
    }

    if (!isSuspended && isAccessingSuspendedPage) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Prevent logged-in users from visiting auth pages
    if (isPublicRoute(req) && !isAccessingSuspendedPage) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Admin protection
    const userRole = sessionClaims?.metadata?.role;
    if (isAdminRoute(req) && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  }

  // =========================
  // NON-AUTH USERS (AND CRAWLERS)
  // =========================
  const userAgent = req.headers.get('user-agent') || '';
  const isCrawler = SOCIAL_CRAWLERS.test(userAgent) && isCrawlerAccessibleRoute(req);

  // Normal users are locked here. Crawlers skip the lock!
  if (!isPublicRoute(req) && !isCrawler) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};