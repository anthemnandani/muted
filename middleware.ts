import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: ['/api(.*)'],
  // async afterAuth(auth, req) {
  //   if (auth.isPublicRoute) {
  //     return NextResponse.next();
  //   }

  //   const url = new URL(req.nextUrl.origin);

  //   if (!auth.userId) {
  //     url.pathname = '/sign-in';
  //     return NextResponse.redirect(url);
  //   }

  //   const user = await clerkClient.users.getUser(auth.userId);

  //   if (!user) {
  //     throw new Error('User not found.');
  //   }

  //   if (!user.privateMetadata.role) {
  //     await clerkClient.users.updateUserMetadata(auth.userId, {
  //       privateMetadata: {
  //         role: 'user',
  //       },
  //     });
  //   }
  // },
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
