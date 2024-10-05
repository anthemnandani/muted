'use client';

import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { Icons } from '../icons';
import CreateThread from '../modals/CreateThread';
import MenuLink from './MenuLink';

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
      <CreateThread />
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
