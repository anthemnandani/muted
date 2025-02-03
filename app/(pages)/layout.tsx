import BottomBar from '@/components/shared/BottomBar';
import LeftSideBar from '@/components/shared/LeftSideBar';
import TopBar from '@/components/shared/TopBar';
import { getUserEmail } from '@/lib/utils';
import { db } from '@/server/db';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

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
    <>
      <TopBar />
      <LeftSideBar />
      <main
        id='main-scroll-container'
        className='h-screen overflow-y-scroll snap-y snap-mandatory smooth-scroll hide-scrollbar'
      >
        <div className='grid place-items-center min-h-screen'>{children}</div>
      </main>
      <BottomBar />
    </>
  );
}
