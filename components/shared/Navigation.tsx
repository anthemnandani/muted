'use client';

import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { Icons } from '../icons';
import MenuLink from './MenuLink';
import NewPost from '../modals/NewPost';
import { Fragment, useState } from 'react';
import { cn } from '@/lib/utils';
import SearchSidebar from '../search/SearchSidebar';

const Navigation = () => {
  const pathname = usePathname();
  const { user } = useUser();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <Fragment>
      <MenuLink
        route='/'
        icon={Icons.home}
        isActive={pathname === '/' && !isSearchOpen}
        addFill
      />
      <button
        onClick={toggleSearch}
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
      <MenuLink
        route='/activity'
        icon={Icons.activity}
        isActive={pathname === '/activity' && !isSearchOpen}
        addFill
      />
      <MenuLink
        route={`/@${user?.username}`}
        icon={Icons.profile}
        isActive={!!pathname.match(/^\/@\w+$/) && !isSearchOpen}
        addFill
      />
      <SearchSidebar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </Fragment>
  );
};

export default Navigation;
