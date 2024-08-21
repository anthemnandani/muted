import { LucideIcon } from 'lucide-react';
import React from 'react';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  className?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon: Icon,
  label,
  onClick,
  className,
}) => (
  <DropdownMenuItem
    className={cn('dropdown-menu-item', className)}
    onClick={onClick}
  >
    <Icon className='mr-2 h-4 w-4' />
    <span>{label}</span>
  </DropdownMenuItem>
);

export default MenuItem;
