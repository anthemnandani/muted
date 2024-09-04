'use client';
import { usePathname } from 'next/navigation';
import { Icons } from '../icons';
import CreateThread from '../modals/CreateThread';
import MenuLink from './MenuLink';
import { useUser } from '@clerk/nextjs';
import { getUsername } from '@/lib/utils';
import useWindow from '@/hooks/useWindow';

const Navigation = () => {
  const pathname = usePathname();
  const { user } = useUser();
  const username = getUsername(user!);
  const { isMobile } = useWindow();
  return (
    <>
      <MenuLink
        route='/'
        icon={Icons.home}
        isActive={pathname === '/'}
        addFill
      />
      <MenuLink
        route='/'
        icon={Icons.search}
        isActive={pathname === '/search'}
      />
      {isMobile && <CreateThread />}
      <MenuLink
        route='/activity'
        icon={Icons.activity}
        isActive={pathname === '/search'}
        addFill
      />
      <MenuLink
        route={`/@${username}`}
        icon={Icons.profile}
        isActive={!!pathname.match(/^\/@\w+$/)}
        addFill
      />
    </>
  );
};

export default Navigation;
