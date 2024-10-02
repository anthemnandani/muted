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
      <main className='flex justify-center h-screen'>
        <section className='w-full'>
          <div className='w-full md:max-w-[640px] mx-auto relative'>
            {children}
          </div>
        </section>
      </main>
      <BottomBar />
    </>
  );
}
