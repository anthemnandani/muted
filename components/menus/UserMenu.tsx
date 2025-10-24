'use client';

import useWindow from '@/hooks/useWindow';
import { SignOutButton } from '@clerk/nextjs';
import { AlertCircle, Bookmark, Heart, LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Icons } from '../icons';
import MenuItem from '../shared/MenuItem';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const UserMenu = () => {
  const router = useRouter();
  const { isMobile } = useWindow();
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <div>
          <Icons.menu className='menu-icon w-5 h-5 ml-1' />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='dropdown-content-container ml-4 w-[200px] p-0 rounded-lg'>
        {/* <AppearanceMenu theme={theme!} setTheme={setTheme} /> */}
        <MenuItem
          icon={Settings}
          label='Settings'
          className='py-2'
          onClick={() => router.push('/setting')}
        />
        <MenuItem
          icon={AlertCircle}
          label='Report a problem'
          className='py-2'
        />
        {isMobile && (
          <MenuItem
            icon={Bookmark}
            label='Saved'
            className='py-2'
            onClick={() => router.push('/saved')}
          />
        )}
        {isMobile && (
          <MenuItem
            icon={Heart}
            label='Liked'
            className='py-2'
            onClick={() => router.push('/liked')}
          />
        )}

        <DropdownMenuSeparator />
        <SignOutButton>
          <MenuItem icon={LogOut} label='Log out' className='py-2' />
        </SignOutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
