import Report from '@/components/modals/Report';
import TopBar from '@/components/shared/TopBar';
import LeftSideBar from '@/components/sidebars/LeftSideBar';
import { PostNavigatorProvider } from '@/contexts/PostNavigatorContext';
import { db } from '@/server/db';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function PagesLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
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
    <>
      <TopBar />
      <LeftSideBar />
      <PostNavigatorProvider>{children}</PostNavigatorProvider>
      {/* <BottomBar /> */}
      <Report />
      {modal}
    </>
  );
}
