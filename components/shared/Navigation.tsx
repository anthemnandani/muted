'use client';

import { cn } from '@/lib/utils';
import { useNotificationStore } from '@/store/notificationStore';
import { useSearchStore } from '@/store/searchStore';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Icons } from '../icons';
import NewPost from '../modals/NewPost';
import MenuLink from './MenuLink';

const Navigation = () => {
  const { isSearchOpen, setIsSearchOpen } = useSearchStore();
  const { isNotificationOpen, setIsNotificationOpen } = useNotificationStore();
  const pathname = usePathname();
  const { user } = useUser();

  useEffect(() => {
    if (isSearchOpen) {
      setIsSearchOpen(false);
    }
    if (isNotificationOpen) {
      setIsNotificationOpen(false);
    }
  }, [pathname]);

  return (
    <ul className='flex flex-col items-center gap-4 w-full'>
      <MenuLink
        route='/'
        icon={Icons.home}
        isActive={pathname === '/' && !isSearchOpen}
        addFill
      />
      <button
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        className={cn(
          'flex-center size-12 transition-all duration-150',
          isSearchOpen
            ? 'bg-[#1f1f1f] rounded-full'
            : 'hover:bg-primary rounded-xl'
        )}
      >
        <Icons.search
          className={cn(
            'size-6 transition-colors duration-150',
            isSearchOpen ? 'text-foreground' : 'text-secondary'
          )}
        />
      </button>
      <NewPost />
      <MenuLink
        route='/following'
        icon={Icons.following}
        isActive={pathname === '/following' && !isSearchOpen}
      />
      <MenuLink
        route='/friends'
        icon={Icons.friends}
        isActive={pathname === '/friends' && !isSearchOpen}
      />
      <button
        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
        className={cn(
          'flex-center size-12 transition-all duration-150',
          isNotificationOpen
            ? 'bg-[#1f1f1f] rounded-full'
            : 'hover:bg-primary rounded-xl'
        )}
      >
        <Icons.activity
          className={cn(
            'size-6 transition-colors duration-150',
            isNotificationOpen ? 'text-foreground' : 'text-secondary'
          )}
        />
      </button>
      <MenuLink
        route={`/@${user?.username}`}
        icon={Icons.profile}
        isActive={!!pathname.match(/^\/@\w+$/) && !isSearchOpen}
        addFill
      />
    </ul>
  );
};

export default Navigation;
