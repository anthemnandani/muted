'use client';
import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '../icons';
import NavigationMenu from './NavigationMenu';
import Image from 'next/image';

const LeftSideBar = () => {
  const pathname = usePathname();
  const { theme } = useTheme();

  return (
    <section className='hidden sticky left-0 top-0 z-20 w-[76px] h-screen md:flex-col-between'>
      <Link
        href='/'
        className='text-2xl font-semibold tracking-wide cursor-pointer active:scale-95 transform transition-all duration-150 ease-out hover:scale-105 z-[50] py-4'
      >
        <Image
          src={`/assets/muted-logo-${
            theme === 'light' ? 'black' : 'white'
          }.svg`}
          alt='Logo'
          width={36}
          height={36}
        />
      </Link>
      <ul className='flex-col-center gap-4 w-full'>
        {sidebarLinks.map((link) => {
          const isActive =
            link.route === pathname ||
            (pathname.includes(link.route) && link.route.length > 1);
          const Icon = link.icon;

          return (
            <div key={link.label}>
              <Link
                href={link.route}
                className='relative w-15 h-12 flex-center rounded-xl hover:bg-primary transition-colors duration-150'
              >
                <Icon
                  className={cn(
                    'h-6 w-6 transition-colors duration-150',
                    isActive ? 'text-foreground' : 'text-secondary'
                  )}
                  fill={
                    isActive && link.addFill ? 'currentColor' : 'transparent'
                  }
                />
              </Link>
            </div>
          );
        })}
      </ul>
      <NavigationMenu />
    </section>
  );
};

export default LeftSideBar;
