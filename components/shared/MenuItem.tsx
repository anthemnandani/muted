import { MenuItemProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import React from 'react';

const MenuItem: React.FC<MenuItemProps> = ({
  icon: Icon,
  label,
  onClick,
  className,
  disabled,
}) => (
  <button
    type='button'
    className={cn(
      'w-full flex items-center gap-3 py-2.5 px-3',
      'text-white hover:bg-white/10 transition-colors',
      'text-sm font-normal',
      disabled && 'opacity-50 cursor-not-allowed',
      className
    )}
    onClick={onClick}
    disabled={disabled}
  >
    {Icon && <Icon className='size-4 min-w-4' />}
    <span>{label}</span>
  </button>
);

export default MenuItem;
