'use client';

import useWindow from '@/hooks/useWindow';
import { SignOutButton, useUser } from '@clerk/nextjs';
import { Role } from '@prisma/client';
import {
  AlertCircle,
  Bookmark,
  Heart,
  LogOut,
  Settings,
  ShieldCheck,
} from 'lucide-react';
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
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <div>
          <Icons.menu className='menu-icon w-5 h-5 ml-1' />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='bg-gray-6 shadow-2xl z-[1001] ml-4 w-[200px] p-0 rounded-lg'>
        {/* <AppearanceMenu theme={theme!} setTheme={setTheme} /> */}
        <MenuItem
          icon={Settings}
          label='Settings'
          onClick={() => router.push('/setting')}
        />
        <MenuItem icon={AlertCircle} label='Report a problem' />
        {userRole === Role.ADMIN && (
          <MenuItem
            label='Admin Panel'
            icon={ShieldCheck}
            onClick={() => router.push('/admin')}
          />
        )}
        {isMobile && (
          <MenuItem
            icon={Bookmark}
            label='Saved'
            onClick={() => router.push('/saved')}
          />
        )}
        {isMobile && (
          <MenuItem
            icon={Heart}
            label='Liked'
            onClick={() => router.push('/liked')}
          />
        )}

        <DropdownMenuSeparator />
        <SignOutButton>
          <MenuItem icon={LogOut} label='Log out' />
        </SignOutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
