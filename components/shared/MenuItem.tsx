import { MenuItemProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import React from 'react';
import { DropdownMenuItem } from '../ui/dropdown-menu';

const MenuItem: React.FC<MenuItemProps> = ({
  icon: Icon,
  label,
  onClick,
  onSelect,
  isActionMenuItem,
  className,
  disabled,
}) => (
  <DropdownMenuItem
    className={cn('dropdown-menu-item', className)}
    onClick={onClick}
    onSelect={onSelect}
    disabled={disabled}
  >
    {isActionMenuItem ? (
      <>
        {label}
        {Icon && <Icon className='h-5 w-5' />}
      </>
    ) : (
      <>
        {Icon && <Icon className='mr-2 h-4 w-4' />}
        {label}
      </>
    )}
  </DropdownMenuItem>
);

export default MenuItem;
