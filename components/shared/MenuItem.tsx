import { MenuItemProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import React from 'react';
import { DropdownMenuItem } from '../ui/dropdown-menu';

const MenuItem: React.FC<MenuItemProps> = ({
  icon: Icon,
  label,
  onClick,
  isActionMenuItem,
  className,
}) => (
  <DropdownMenuItem
    className={cn('dropdown-menu-item', className)}
    onClick={onClick}
  >
    {isActionMenuItem ? (
      <>
        <span>{label}</span>
        <Icon className='h-5 w-5' />
      </>
    ) : (
      <>
        <Icon className='mr-2 h-4 w-4' />
        <span>{label}</span>
      </>
    )}
  </DropdownMenuItem>
);

export default MenuItem;
