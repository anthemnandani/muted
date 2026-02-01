'use client';

import useHomeNavigation from '@/hooks/useHomeNavigation';
import Image from 'next/image';
import Link from 'next/link';
import UserMenu from '../menus/UserMenu';
import Navigation from '../shared/Navigation';
import NotificationSidebar from './NotificationSidebar';
import SearchSidebar from './SearchSidebar';

const LeftSideBar = () => {
  const { handleHomeClick } = useHomeNavigation();

  return (
    <div className='z-[101] w-[76px] flex-shrink-0'>
      <section className='hidden md:fixed left-0 top-0 w-[76px] overscroll-contain overflow-x-clip overflow-y-hidden h-screen md:flex-col-between'>
        <Link href='/' className='logo' onClick={handleHomeClick}>
          <Image
            src={`/assets/muted-logo-white.svg`}
            alt='Logo'
            width={36}
            height={36}
            unoptimized
            priority
          />
        </Link>
        <Navigation />

        <div className='flex flex-col items-center gap-8 mt-[15px] mb-10'>
          <UserMenu />
        </div>
      </section>
      <SearchSidebar />
      <NotificationSidebar />
    </div>
  );
};

export default LeftSideBar;
