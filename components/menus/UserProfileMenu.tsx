'use client';
import { Info } from 'lucide-react';
import { Icons } from '../icons';
import MenuItem from '../shared/MenuItem';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const UserProfileMenu = () => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <div className='flex-center relative hover:before:content-[""] hover:before:absolute hover:before:bg-primary hover:before:z-[2] hover:before:-inset-1 hover:before:rounded-full cursor-pointer '>
          <Icons.circleMenu className='aspect-square object-cover object-center size-6 overflow-hidden flex-1' />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align='end'
        className='dropdown-content-container !rounded-xl !w-[220px]'
      >
        <MenuItem
          icon={Icons.copyLink}
          label='Copy link'
          className='flex-between py-3.5 px-4'
          isActionMenuItem
        />
        <MenuItem
          icon={Info}
          label='About this profile'
          className='flex-between py-3.5 px-4'
          isActionMenuItem
        />
        <DropdownMenuSeparator />
        <MenuItem
          icon={Icons.mute}
          label='Mute'
          className='flex-between py-3.5 px-4'
          isActionMenuItem
        />
        <MenuItem
          icon={Icons.restrict}
          label='Restrict'
          className='flex-between py-3.5 px-4'
          isActionMenuItem
        />
        <DropdownMenuSeparator />

        <MenuItem
          icon={Icons.block}
          label='Block'
          className='flex-between py-3.5 px-4 text-primary-red'
          isActionMenuItem
        />
        <MenuItem
          icon={Icons.report}
          label='Report'
          className='flex-between py-3.5 px-4 text-primary-red'
          isActionMenuItem
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileMenu;
