'use client';
import { AppearanceMenuProps } from '@/lib/types';
import { Laptop, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import MenuItem from '../shared/MenuItem';
import {
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '../ui/dropdown-menu';

const AppearanceMenu: React.FC<AppearanceMenuProps> = ({ theme, setTheme }) => {
  const { resolvedTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState(theme);

  useEffect(() => {
    if (resolvedTheme) {
      setCurrentTheme(resolvedTheme);
    }
  }, [resolvedTheme]);

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className='dropdown-menu-item'>
        {currentTheme === 'light' && <Sun className='mr-2 size-4' />}
        {currentTheme === 'dark' && <Moon className='mr-2 size-4' />}
        {currentTheme === 'system' && <Laptop className='mr-2 size-4' />}
        <span>Appearance</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className='dropdown-content-container w-[200px] p-0 max-md:w-[140px] rounded-lg'>
          <MenuItem
            icon={Sun}
            label='Light'
            onClick={() => setTheme('light')}
          />
          <MenuItem icon={Moon} label='Dark' onClick={() => setTheme('dark')} />
          <MenuItem
            icon={Laptop}
            label='System'
            onClick={() => setTheme('system')}
          />
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
};

export default AppearanceMenu;
