'use client';

import useCopyLink from '@/hooks/useCopyLink';
import useHideLikes from '@/hooks/useHideLikes';
import type { AuthorInfoProps } from '@/lib/types';
import { useThreadStore } from '@/store/threadStore';
import { useUser } from '@clerk/nextjs';
import { MoreHorizontal } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Icons } from '../icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const { setEditPostInfo, setOpenDialog } = useThreadStore();

  const { handleToggleHideLikes, isLoading } = useHideLikes({
    postId,
    hideLikes,
  });

  const { handleCopyLink } = useCopyLink({ postId, username });

  useEffect(() => {
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
        <div className='flex-center relative hover:before:content-[""] hover:before:absolute hover:before:bg-primary-2 hover:before:z-[2] hover:before:-inset-2 hover:before:rounded-full cursor-pointer'>
          <MoreHorizontal className='aspect-square object-cover object-center size-5 overflow-hidden flex-1 text-white/90' />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align='end'
        className='shadow-xl bg-gray-6 z-[1001] rounded-xl p-0 w-[220px]'
      >
        {(!repostedBy && user?.id !== authorId) ||
        (repostedBy && user?.id !== repostedBy?.id) ? (
          <>
            <DropdownMenuItem className='dropdown-menu-item'>
              Not Interested
              <Icons.notInterested className='size-5' />
            </DropdownMenuItem>

            <DropdownMenuItem className='dropdown-menu-item'>
              Mute
              <Icons.mute className='size-5' />
            </DropdownMenuItem>
            <DropdownMenuItem className='dropdown-menu-item'>
              Block
              <Icons.block className='size-5' />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='dropdown-menu-item'>
              Report
              <Icons.report className='size-5' />
            </DropdownMenuItem>
          </>
        ) : (
          <>
            {/* {timeLeft > 0 && (
              <>
                <DropdownMenuItem
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
                >
                Edit
                <Icons.edit className='size-5' />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )} */}

            <DropdownMenuItem className='dropdown-menu-item'>
              Pin to profile
              <Icons.profilePin className='size-5' />
            </DropdownMenuItem>

            <DropdownMenuItem
              className='dropdown-menu-item'
              onClick={handleToggleHideLikes}
              disabled={isLoading}
            >
              {hideLikes ? 'Unhide like counts' : 'Hide like counts'}
              <Icons.hide className='size-5' />
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='dropdown-menu-item'
          onClick={handleCopyLink}
        >
          Copy link
          <Icons.copyLink className='size-5' />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThreadActionMenu;
