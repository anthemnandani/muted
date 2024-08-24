import BottomBar from '@/components/shared/BottomBar';
import LeftSideBar from '@/components/shared/LeftSideBar';
import TopBar from '@/components/shared/TopBar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopBar />
      <main className='flex'>
        <LeftSideBar />
        <section className='min-h-screen flex-col flex-1 items-center pt-28 px-6 pb-10 max-md:pb-32 sm:px-10'>
          <div className='w-full max-w-4xl'>{children}</div>
        </section>
        {/* <RightSideBar /> */}
      </main>
      <BottomBar />
    </>
  );
}
