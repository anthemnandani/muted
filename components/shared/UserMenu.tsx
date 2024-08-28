'use client';
import { useAuth } from '@clerk/nextjs';
import { AlertCircle, Bookmark, Heart, LogOut, Settings } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Icons } from '../icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import AppearanceMenu from './AppearanceMenu';
import MenuItem from './MenuItem';
import useWindow from '@/hooks/useWindow';

const UserMenu = () => {
  const { signOut } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { isMobile } = useWindow();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <Icons.menu className='menu-icon w-5 h-5 ml-1' />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='dropdown-content-container ml-4 w-[200px]'>
        <AppearanceMenu theme={theme!} setTheme={setTheme} />
        <MenuItem icon={Settings} label='Settings' className='py-2' />
        <MenuItem
          icon={AlertCircle}
          label='Report a problem'
          className='py-2'
        />
        {isMobile && (
          <MenuItem icon={Bookmark} label='Saved' className='py-2' />
        )}
        {isMobile && (
          <MenuItem icon={Heart} label='Your likes' className='py-2' />
        )}
        <MenuItem
          icon={AlertCircle}
          label='Report a problem'
          className='py-2'
        />
        <DropdownMenuSeparator />
        <MenuItem
          icon={LogOut}
          label='Log out'
          onClick={() => signOut(() => router.push('/'))}
          className='py-2'
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
