import { MenuLinkProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const triggerFeedRefresh = () => {
  const event = new CustomEvent('refreshFeed');
  window.dispatchEvent(event);
};

const MenuLink: React.FC<MenuLinkProps> = ({
  route,
  isActive,
  addFill,
  icon: Icon,
}) => {
  const pathname = usePathname();

  const isHome = route === '/' && pathname === '/';

  const handleClick = (e: React.MouseEvent) => {
    if (isHome) {
      e.preventDefault();

      triggerFeedRefresh();

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Link
      href={route}
      className='relative w-15 h-12 flex-center rounded-xl hover:bg-primary transition-colors duration-150'
      onClick={handleClick}
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
