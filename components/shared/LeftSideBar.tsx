'use client';
import useDevice from '@/hooks/useDevice';
import Image from 'next/image';
import Link from 'next/link';
import UserMenu from '../menus/UserMenu';
import Navigation from './Navigation';

const LeftSideBar = () => {
  const { isMobile } = useDevice();

  return (
    !isMobile && (
      <section className='hidden fixed left-0 top-0 z-20 w-[76px] h-screen md:flex-col-between'>
        <Link href='/' className='logo'>
          <Image
            src={`/assets/muted-logo-white.svg`}
            alt='Logo'
            width={36}
            height={36}
          />
        </Link>
        <ul className='flex flex-col items-center gap-4 w-full'>
          <Navigation />
        </ul>
        <div className='flex flex-col items-center gap-8 mt-[15px] mb-10'>
          <UserMenu />
        </div>
      </section>
    )
  );
};

export default LeftSideBar;
