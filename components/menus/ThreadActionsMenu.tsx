'use client';

import useCopyLink from '@/hooks/useCopyLink';
import useDeleteThread from '@/hooks/useDeleteThread';
import useHideLikes from '@/hooks/useHideLikes';
import usePinThread from '@/hooks/usePinThread';
import useToggleHideThread from '@/hooks/useToggleHideThread';
import useToggleMuteUser from '@/hooks/useToggleMuteUser';
import { ThreadActionMenuProps } from '@/lib/types';
import { formatTimeLeft } from '@/lib/utils';
import { useBlockedUsers } from '@/store/blockedUsers';
import { useReportStore } from '@/store/reportStore';
import { useThreadStore } from '@/store/threadStore';
import { useUser } from '@clerk/nextjs';
import { MoreHorizontal, PinOff } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import { Icons } from '../icons';
import BlockUser from '../modals/BlockUser';
import ConfirmDialog from '../modals/ConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const ThreadActionMenu: React.FC<ThreadActionMenuProps> = ({
  authorId,
  id,
  repostedBy,
  createdAt,
  currentText,
  username,
  hideLikes,
  mentions,
  privacy,
  linkPreview,
  pinned,
}) => {
  const { user } = useUser();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [blockUserOpen, setBlockUserOpen] = useState(false);
  const {
    deleteThreadId,
    setEditThreadInfo,
    setOpenDialog,
    setDeleteThreadId,
  } = useThreadStore();

  const { handleDeleteThread } = useDeleteThread({
    id,
    onClose: () => {
      setIsMenuOpen(false);
      setDeleteThreadId(null);
    },
  });

  const { handleToggleHideLikes, isLoading } = useHideLikes({
    postId: id,
    hideLikes,
  });

  const { openThreadReport } = useReportStore();

  const { handleCopyLink } = useCopyLink({ threadId: id, username });

  const { togglePin } = usePinThread({ id, pinned });

  const { toggleHide } = useToggleHideThread({ threadId: id });

  const { toggleMute } = useToggleMuteUser({ userId: authorId });

  const { isUserBlocked } = useBlockedUsers();

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
      setEditThreadInfo(null);
    }

    return () => clearInterval(timer);
  }, [createdAt]);

  const isDeleteOpen = deleteThreadId === id;
  const isBlockedByMe = isUserBlocked(authorId);

  return (
    <Fragment>
      <ConfirmDialog
        open={isDeleteOpen}
        setOpen={(open) => {
          if (!open) setDeleteThreadId(null);
        }}
        closeMenu={() => setIsMenuOpen(false)}
        title='Delete Thread'
        description="If you delete this thread, you won't be able to restore it."
        onClick={handleDeleteThread}
      />
      <BlockUser
        isOpen={blockUserOpen}
        setIsOpen={setBlockUserOpen}
        username={username}
        userId={authorId}
        closeMenu={() => setIsMenuOpen(false)}
        isThread
      />
      <DropdownMenu
        modal={false}
        open={isMenuOpen}
        onOpenChange={setIsMenuOpen}
      >
        <DropdownMenuTrigger asChild>
          <div className='icon-container-hover hover:before:bg-primary-2'>
            <MoreHorizontal className='aspect-square object-cover object-center size-5 overflow-hidden flex-1 text-white/90' />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align='end'
          className='shadow-xl bg-gray-6 z-[1001] rounded-xl p-0 w-[220px]'
        >
          {(!repostedBy && user?.id !== authorId) ||
          (repostedBy && user?.id !== repostedBy?.id) ? (
            <Fragment>
              <DropdownMenuItem
                className='dropdown-menu-item'
                onClick={toggleHide}
              >
                Not Interested
                <Icons.notInterested className='size-5' />
              </DropdownMenuItem>

              <DropdownMenuItem
                className='dropdown-menu-item'
                onClick={toggleMute}
              >
                Mute
                <Icons.mute className='size-5' />
              </DropdownMenuItem>

              <DropdownMenuItem
                className='dropdown-menu-item text-primary-red hover:!text-primary-red'
                onSelect={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  setBlockUserOpen(true);
                }}
              >
                {isBlockedByMe ? 'Unblock' : 'Block'}
                {isBlockedByMe ? (
                  <Icons.unblock className='size-5' />
                ) : (
                  <Icons.block className='size-5' />
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='dropdown-menu-item text-primary-red focus:text-primary-red'
                onClick={() => {
                  openThreadReport(id);
                  setIsMenuOpen(false);
                }}
              >
                Report
                <Icons.report className='size-5' />
              </DropdownMenuItem>
            </Fragment>
          ) : (
            <Fragment>
              {timeLeft > 0 && (
                <Fragment>
                  <DropdownMenuItem
                    className='dropdown-menu-item'
                    onClick={() => {
                      setEditThreadInfo({
                        id,
                        text: currentText,
                        mentions,
                        privacy,
                        linkPreview,
                      });
                      setOpenDialog(true);
                    }}
                  >
                    <p>Edit</p>
                    <p className='text-[15px] text-white/50'>
                      {formatTimeLeft(timeLeft)}
                    </p>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </Fragment>
              )}

              <DropdownMenuItem
                className='dropdown-menu-item'
                onClick={togglePin}
              >
                {pinned ? 'Unpin from profile' : 'Pin to profile'}
                {pinned ? (
                  <PinOff className='size-5' />
                ) : (
                  <Icons.profilePin className='size-5' />
                )}
              </DropdownMenuItem>

              <DropdownMenuItem
                className='dropdown-menu-item'
                onClick={handleToggleHideLikes}
                disabled={isLoading}
              >
                {hideLikes ? 'Unhide like counts' : 'Hide like counts'}
                <Icons.hide className='size-5' />
              </DropdownMenuItem>
              <DropdownMenuItem
                className='dropdown-menu-item text-primary-red hover:!text-primary-red'
                onClick={() => {
                  setDeleteThreadId(id);
                  setIsMenuOpen(false);
                }}
              >
                Delete
                <Icons.delete className='size-5 text-primary-red' />
              </DropdownMenuItem>
            </Fragment>
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
    </Fragment>
  );
};

export default ThreadActionMenu;
