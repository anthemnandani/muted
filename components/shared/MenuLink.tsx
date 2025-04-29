'use client';

import useHomeNavigation from '@/hooks/useHomeNavigation';
import { MenuLinkProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const MenuLink: React.FC<MenuLinkProps> = ({
  route,
  isActive,
  addFill,
  icon: Icon,
}) => {
  const pathname = usePathname();
  const { handleHomeClick } = useHomeNavigation();
  const isHome = pathname === '/' && route === '/';

  const handleClick = isHome ? handleHomeClick : undefined;

  return (
    <Link
      href={route}
      onClick={handleClick}
      className='relative w-15 h-12 flex-center rounded-xl hover:bg-primary transition-colors duration-150'
    >
      <Icon
        className={cn(
          'size-6 transition-colors duration-150',
          isActive ? 'text-foreground' : 'text-secondary'
        )}
        fill={isActive && addFill ? 'currentColor' : 'transparent'}
      />
    </Link>
  );
};

export default MenuLink;
