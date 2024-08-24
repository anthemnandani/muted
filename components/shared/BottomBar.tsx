'use client';
import Navigation from './Navigation';

const BottomBar = () => {
  return (
    <section className='dark:bg-[#101010D9] bg-background fixed bottom-0 z-20 w-full backdrop-blur-lg md:hidden p-4'>
      <ul className='flex items-center justify-between gap-3 xs:gap-5'>
        <Navigation />
      </ul>
    </section>
  );
};

export default BottomBar;
