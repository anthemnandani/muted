import BottomBar from '@/components/shared/BottomBar';
import LeftSideBar from '@/components/shared/LeftSideBar';
import TopBar from '@/components/shared/TopBar';
import { getUserEmail } from '@/lib/utils';
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
      email: getUserEmail(user),
    },
  });

  if (!dbUser?.verified) redirect('/account?origin=/');

  return (
    <React.Fragment>
      <TopBar />
      <LeftSideBar />
      {children}
      <BottomBar />
    </React.Fragment>
  );
}
