import Report from '@/components/modals/Report';
import TopBar from '@/components/shared/TopBar';
import LeftSideBar from '@/components/sidebars/LeftSideBar';
import { PostNavigatorProvider } from '@/contexts/PostNavigatorContext';
import { db } from '@/server/db';
import { currentUser } from '@clerk/nextjs/server';
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

  if ((dbUser && !dbUser.verified) || !dbUser) redirect('/account?origin=/');

  return (
    <div className='flex justify-between w-screen max-w-full flex-auto self-center'>
      <TopBar />
      <LeftSideBar />
      <PostNavigatorProvider>
        <main className='relative mx-auto my-0 w-full min-w-[420px] flex-shrink flex-stretch'>
          {children}
        </main>
      </PostNavigatorProvider>
      {/* <BottomBar /> */}
      <Report />
    </div>
  );
}
