'use client';
import { Info } from 'lucide-react';
import { Icons } from '../icons';
import MenuItem from '../shared/MenuItem';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Separator } from '../ui/separator';

const UserProfileMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size='icon'
          className='size-10 bg-white-13 hover:bg-white-8 rounded-md transition-colors duration-200'
        >
          <Icons.ellipsis className='size-5 text-neutral-50' />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align='start'
        className='min-w-[190px] p-0 bg-neutral-900 rounded-xl'
      >
        <MenuItem icon={Icons.copyLink} label='Copy link' isActionMenuItem />
        <MenuItem icon={Info} label='About this profile' isActionMenuItem />
        <Separator />
        <MenuItem icon={Icons.mute} label='Mute' isActionMenuItem />
        <MenuItem icon={Icons.restrict} label='Restrict' isActionMenuItem />
        <Separator />

        <MenuItem icon={Icons.block} label='Block' isActionMenuItem />
        <MenuItem icon={Icons.report} label='Report' isActionMenuItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileMenu;
