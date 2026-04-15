'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import UserMenu from '../menus/UserMenu';
import useBreakpoint from '@/hooks/useBreakpoint';

const TopBar = () => {
  const { isMobile } = useBreakpoint();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const changeBgColor = () => {
      window.scrollY > 0 ? setIsScrolled(true) : setIsScrolled(false);
    };
    window.addEventListener('scroll', changeBgColor);
    return () => window.removeEventListener('scroll', changeBgColor);
  }, [isScrolled]);

  return isMobile ? (
    <header
      className={cn(
        'sticky top-[-1px] z-30 w-full',
        isScrolled ? 'bg-[#101010D9] backdrop-blur-2xl' : 'bg-transparent'
      )}
    >
      <nav className='sm:container sm:max-w-[1250px] px-4'>
        <div className='relative w-full flex-between max-h-[60px] sm:max-h-full h-full py-1 z-50'>
          <Link href='/' className='logo w-full sm:w-fit flex-center'>
            <Image
              src='/assets/muted-logo-white.svg'
              alt='Logo'
              width={34}
              height={34}
            />
          </Link>
          <div className='absolute right-0 -translate-y-1/2 top-1/2 z-[999]'>
            <UserMenu />
          </div>
        </div>
      </nav>
    </header>
  ) : null;
};

export default TopBar;
