'use client';
import type { AuthorInfoProps } from '@/lib/types';
import { useUser } from '@clerk/nextjs';
import { MoreHorizontal } from 'lucide-react';
import { Icons } from '../icons';
import DeletePost from '../modals/DeletePost';
import MenuItem from '../shared/MenuItem';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface ThreadActionMenuProps {
  authorId: string;
  postId: string;
  repostedBy?: AuthorInfoProps;
}

const ThreadActionMenu: React.FC<ThreadActionMenuProps> = ({
  authorId,
  postId,
  repostedBy,
}) => {
  const { user } = useUser();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <div className='flex-center relative hover:before:content-[""] hover:before:absolute hover:before:bg-primary hover:before:z-[2] hover:before:-inset-2 hover:before:rounded-full cursor-pointer'>
          <MoreHorizontal className='aspect-square object-cover object-center size-4 overflow-hidden flex-1 text-secondary' />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align='end'
        className='dropdown-content-container rounded-xl p-0 w-[220px]'
      >
        {(!repostedBy && user?.id !== authorId) ||
        (repostedBy && user?.id !== repostedBy?.id) ? (
          <>
            <MenuItem
              icon={Icons.notInterested}
              label='Not interested'
              className='flex-between py-3.5 px-4'
              isActionMenuItem
            />

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
            <DropdownMenuSeparator />
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
            <DeletePost postId={postId} isRepost={!!repostedBy} />
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThreadActionMenu;
