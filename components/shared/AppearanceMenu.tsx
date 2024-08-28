import { Laptop, Moon, Sun } from 'lucide-react';
import {
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '../ui/dropdown-menu';
import MenuItem from './MenuItem';

interface AppearanceMenuProps {
  theme: string;
  setTheme: (theme: string) => void;
}

const AppearanceMenu: React.FC<AppearanceMenuProps> = ({ theme, setTheme }) => {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className='dropdown-menu-item'>
        {theme === 'light' && <Sun className='mr-2 h-4 w-4' />}
        {theme === 'dark' && <Moon className='mr-2 h-4 w-4' />}
        {theme === 'system' && <Laptop className='mr-2 h-4 w-4' />}
        <span>Appearance</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className='dropdown-content-container'>
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
