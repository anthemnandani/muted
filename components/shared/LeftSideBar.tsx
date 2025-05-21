'use client';

import useDevice from '@/hooks/useDevice';
import useHomeNavigation from '@/hooks/useHomeNavigation';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment } from 'react';
import UserMenu from '../menus/UserMenu';
import SearchSidebar from '../search/SearchSidebar';
import Navigation from './Navigation';

const LeftSideBar = () => {
  const { isMobile } = useDevice();
  const { handleHomeClick } = useHomeNavigation();

  return (
    !isMobile && (
      <Fragment>
        <section className='hidden fixed left-0 top-0 z-20 w-[76px] h-screen md:flex-col-between'>
          <Link href='/' className='logo' onClick={handleHomeClick}>
            <Image
              src={`/assets/muted-logo-white.svg`}
              alt='Logo'
              width={36}
              height={36}
            />
          </Link>
          <Navigation />

          <div className='flex flex-col items-center gap-8 mt-[15px] mb-10'>
            <UserMenu />
          </div>
        </section>
        <SearchSidebar />
      </Fragment>
    )
  );
};

export default LeftSideBar;
