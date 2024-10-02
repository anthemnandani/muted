'use client';
import { Bookmark, MoreHorizontal } from 'lucide-react';
import { Icons } from '../icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import MenuItem from '../shared/MenuItem';
import { useUser } from '@clerk/nextjs';

const ThreadActionMenu = ({ authorId }: { authorId: string }) => {
  const { user } = useUser();
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <div className='flex items-center justify-center relative hover:before:content-[""] hover:before:absolute hover:before:bg-primary hover:before:z-[2] hover:before:-inset-2 hover:before:rounded-full cursor-pointer '>
          <MoreHorizontal className='aspect-square object-cover object-center h-4 w-4 overflow-hidden flex-1 text-secondary' />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align='end'
        className='dropdown-content-container rounded-xl p-0 w-[220px]'
      >
        <MenuItem
          icon={Bookmark}
          label='Save'
          className='flex-between py-3.5 px-4'
          isActionMenuItem
        />
        {user?.id !== authorId ? (
          <>
            <MenuItem
              icon={Icons.notInterested}
              label='Not interested'
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
              icon={Icons.block}
              label='Block'
              className='flex-between py-3.5 px-4 text-primary-red focus:text-primary-red'
              isActionMenuItem
            />
            <MenuItem
              icon={Icons.report}
              label='Report'
              className='flex-between py-3.5 px-4 text-primary-red focus:text-primary-red'
              isActionMenuItem
            />
          </>
        ) : (
          <>
            <MenuItem
              icon={Icons.profilePin}
              label='Pin to profile'
              className='flex-between py-3.5 px-4'
              isActionMenuItem
            />
            <MenuItem
              icon={Icons.hide}
              label='Hide like and share counts'
              className='flex-between py-3.5 px-4'
              isActionMenuItem
            />
            <DropdownMenuSeparator />
            <MenuItem
              icon={Icons.delete}
              label='Delete'
              className='flex-between py-3.5 px-4 text-primary-red focus:text-primary-red'
              isActionMenuItem
            />
          </>
        )}

        <DropdownMenuSeparator />
        <MenuItem
          icon={Icons.copyLink}
          label='Copy link'
          className='flex-between py-3.5 px-4'
          isActionMenuItem
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThreadActionMenu;
