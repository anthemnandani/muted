import CreateThreadDesktop from '@/components/buttons/CreateThreadDesktop';
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
      <LeftSideBar />
      <main className='flex justify-center'>
        <section className='min-h-screen w-full md:pt-[60px] px-4 md:px-10'>
          <div className='w-full max-w-[640px] mx-auto'>{children}</div>
        </section>
      </main>
      <CreateThreadDesktop />
      <BottomBar />
    </>
  );
}
