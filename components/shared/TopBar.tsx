'use client';
import useWindow from '@/hooks/useWindow';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import UserMenu from '../menus/UserMenu';

const TopBar = () => {
  const { isMobile } = useWindow();
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme } = useTheme();

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
        'sticky top-0 z-10 w-full',
        isScrolled
          ? 'dark:bg-[#101010D9] bg-background backdrop-blur-2xl'
          : 'bg-transparent'
      )}
    >
      <nav className='sm:container sm:max-w-[1250px] px-4'>
        <div className='relative w-full flex-between max-h-[60px] sm:max-h-full h-full py-1 z-50'>
          <Link href='/' className='logo w-full sm:w-fit flex-center'>
            <Image
              src={`/assets/muted-logo-${
                theme === 'light' ? 'black' : 'white'
              }.svg`}
              alt='Logo'
              width={34}
              height={34}
            />
            {/* <p className='max-sm:hidden flex font-bold text-[20px] text-light-1'>
          Muted
        </p> */}
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
