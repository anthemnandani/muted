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
      <main className='flex justify-center h-screen'>
        <section className='w-full md:pt-[60px]'>
          <div className='w-full md:max-w-[640px] mx-auto'>{children}</div>
        </section>
      </main>

      <BottomBar />
    </>
  );
}
