import Report from '@/components/modals/Report';
import TopBar from '@/components/shared/TopBar';
import LeftSideBar from '@/components/sidebars/LeftSideBar';
import { PostNavigatorProvider } from '@/contexts/PostNavigatorContext';
import { db } from '@/server/db';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const dbUser = await db.user.findUnique({
    where: {
      id: user?.id,
    },
    select: {
      verified: true,
      deactivated: true,
    },
  });

  if (dbUser?.deactivated) redirect('/reactivate');

  if (dbUser && !dbUser.verified) redirect('/account?origin=/');

  if (!dbUser) redirect('/account?origin=/');

  return (
    <React.Fragment>
      <TopBar />
      <LeftSideBar />
      <PostNavigatorProvider>{children}</PostNavigatorProvider>
      {/* <BottomBar /> */}
      <Report />
    </React.Fragment>
  );
}
