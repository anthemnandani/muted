'use client';
import { usePathname } from 'next/navigation';
import { Icons } from '../icons';
import CreateThread from '../modals/CreateThread';
import MenuLink from './MenuLink';

const Navigation = () => {
  const pathname = usePathname();
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
      <CreateThread />
      <MenuLink
        route='/activity'
        icon={Icons.activity}
        isActive={pathname === '/search'}
        addFill
      />
      <MenuLink
        route='/profile'
        icon={Icons.profile}
        isActive={pathname === '/profile'}
        addFill
      />
    </>
  );
};

export default Navigation;
