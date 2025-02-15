'use client';

import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { Icons } from '../icons';
import MenuLink from './MenuLink';
import NewPost from '../modals/NewPost';

const Navigation = () => {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <>
      <MenuLink
        route='/'
        icon={Icons.home}
        isActive={pathname === '/'}
        addFill
      />
      <MenuLink
        route='/search'
        icon={Icons.search}
        isActive={pathname === '/search'}
      />
      <NewPost />
      <MenuLink
        route='/activity'
        icon={Icons.activity}
        isActive={pathname === '/activity'}
        addFill
      />
      <MenuLink
        route={`/@${user?.username}`}
        icon={Icons.profile}
        isActive={!!pathname.match(/^\/@\w+$/)}
        addFill
      />
    </>
  );
};

export default Navigation;
