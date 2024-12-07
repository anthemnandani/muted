'use client';

import useCopyLink from '@/hooks/useCopyLink';
import useHideLikes from '@/hooks/useHideLikes';
import type { AuthorInfoProps } from '@/lib/types';
import { formatTimeLeft } from '@/lib/utils';
import useDialog from '@/store/dialog';
import { useUser } from '@clerk/nextjs';
import { MoreHorizontal } from 'lucide-react';
import React from 'react';
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
  createdAt: Date;
  currentText: string;
  username: string;
  hideLikes: boolean;
}

const ThreadActionMenu: React.FC<ThreadActionMenuProps> = ({
  authorId,
  postId,
  repostedBy,
  createdAt,
  currentText,
  username,
  hideLikes,
}) => {
  const { user } = useUser();
  const [timeLeft, setTimeLeft] = React.useState<number>(0);
  const [isOpen, setIsOpen] = React.useState(false);
  const { setEditPostInfo, setOpenDialog } = useDialog();

  const { handleToggleHideLikes, isLoading } = useHideLikes({
    postId,
    setIsOpen,
    hideLikes,
  });

  const { handleCopyLink } = useCopyLink({ postId, username });

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const createdTime = new Date(createdAt).getTime();
      const editDeadline = createdTime + 15 * 60 * 1000;
      const now = Date.now();
      const difference = editDeadline - now;

      return Math.max(0, Math.floor(difference / 1000));
    };

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    setTimeLeft(calculateTimeLeft());
    if (timeLeft <= 0) {
      setEditPostInfo(null);
    }

    return () => clearInterval(timer);
  }, [createdAt]);

  return (
    <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
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
            {timeLeft > 0 && (
              <>
                <MenuItem
                  label={
                    <div className='flex-between w-full'>
                      <p>Edit</p>
                      <p className='text-[15px] text-[#999] dark":text-gray-3'>
                        {formatTimeLeft(timeLeft)}
                      </p>
                    </div>
                  }
                  onClick={() => {
                    setEditPostInfo({ id: postId, text: currentText });
                    setOpenDialog(true);
                  }}
                />
                <DropdownMenuSeparator />
              </>
            )}

            <MenuItem
              icon={Icons.profilePin}
              label='Pin to profile'
              className='flex-between py-3.5 px-4'
              isActionMenuItem
            />

            <MenuItem
              icon={Icons.hide}
              label={hideLikes ? 'Unhide like counts' : 'Hide like counts'}
              className='flex-between py-3.5 px-4'
              onClick={handleToggleHideLikes}
              disabled={isLoading}
              isActionMenuItem
            />

            <DropdownMenuSeparator />
            <DeletePost postId={postId} isRepost={!!repostedBy} />
          </>
        )}
        <DropdownMenuSeparator />
        <MenuItem
          icon={Icons.copyLink}
          label='Copy link'
          className='flex-between py-3.5 px-4'
          onClick={handleCopyLink}
          isActionMenuItem
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThreadActionMenu;
