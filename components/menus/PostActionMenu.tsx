'use client';

import useCopyLink from '@/hooks/useCopyLink';
import useDeletePost from '@/hooks/useDeletePost';
import useTimeLeft from '@/hooks/useTimeLeft';
import useToggleHidePost from '@/hooks/useToggleHidePost';
import useToggleMuteUser from '@/hooks/useToggleMuteUser';
import useTogglePinPost from '@/hooks/useTogglePinPost';
import { PostActionMenuProps } from '@/lib/types';
import { cn, formatTimeLeft } from '@/lib/utils';
import { useMutedUsers } from '@/store/mutedUsers';
import usePostDialog from '@/store/postDialog';
import { useReportStore } from '@/store/reportStore';
import { useUser } from '@clerk/nextjs';
import { Edit, MoreHorizontal, PinOff } from 'lucide-react';
import { Fragment, useState } from 'react';
import { Icons } from '../icons';
import BlockUser from '../modals/BlockUser';
import ConfirmDialog from '../modals/ConfirmDialog';
import MenuItem from '../shared/MenuItem';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Separator } from '../ui/separator';

const PostActionMenu: React.FC<PostActionMenuProps> = ({
  author,
  postId,
  createdAt,
  caption,
  turnOffComments,
  hideLikes,
  pinned,
  showControls,
  media,
  isModal,
}) => {
  const { user } = useUser();
  const { timeLeft } = useTimeLeft({ createdAt });
  const { isMutedUser } = useMutedUsers();
  const { openForEditing } = usePostDialog();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { openPostReport } = useReportStore();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const { handleDeletePost } = useDeletePost({
    id: postId,
    onClose: () => {
      setOpenDeleteDialog(false);
      setMenuOpen(false);
    },
  });

  const { togglePin } = useTogglePinPost({
    postId,
    isPinned: pinned!,
  });

  const { toggleHide } = useToggleHidePost({
    postId,
  });

  const { toggleMute } = useToggleMuteUser({
    userId: author.id,
  });

  const { handleCopyLink } = useCopyLink({ postId, username: author.username });

  const handleEdit = () => {
    openForEditing({
      caption: caption ?? '',
      id: postId,
      turnOffComments,
      hideLikes,
      media,
    });
  };

  return (
    <Fragment>
      <ConfirmDialog
        open={openDeleteDialog}
        setOpen={setOpenDeleteDialog}
        closeMenu={() => setMenuOpen(false)}
        title='Delete Post'
        description="If you delete this post, you won't be able to restore it."
        onClick={handleDeletePost}
      />
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <div
            className={cn(
              'cursor-pointer',
              isModal ? 'post-detail-btn' : 'group dropdown-btn',
              showControls ? 'opacity-100' : 'opacity-0',
            )}
          >
            <MoreHorizontal className='size-6 text-white stroke-[2.5px]' />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align='end'
          className={cn(
            'w-[200px] p-2 border-none rounded-xl bg-black/95 z-[3001]',
            isModal && 'bg-gray-6',
          )}
        >
          {user?.id !== author.id ? (
            <Fragment>
              <MenuItem
                icon={Icons.notInterested}
                label='Not interested'
                onClick={toggleHide}
              />
              <Separator />
              <MenuItem
                icon={Icons.mute}
                label={isMutedUser(author.id) ? 'Unmute' : 'Mute'}
                onClick={toggleMute}
              />
              <Separator />
              <BlockUser
                username={author.username}
                userId={author.id}
                closeMenu={() => setMenuOpen(false)}
                setIsOpen={setIsOpen}
                isOpen={isOpen}
              />
              <Separator />
              <MenuItem
                icon={Icons.report}
                label='Report'
                className='text-primary-red focus:text-primary-red'
                onClick={() => {
                  openPostReport(postId);
                }}
              />
            </Fragment>
          ) : (
            <Fragment>
              {timeLeft > 0 && (
                <Fragment>
                  <MenuItem
                    icon={Edit}
                    label={
                      <div className='flex-between w-full'>
                        <p>Edit</p>
                        <p className='text-[15px] text-gray-3'>
                          {formatTimeLeft(timeLeft)}
                        </p>
                      </div>
                    }
                    onClick={handleEdit}
                  />
                  <Separator />
                </Fragment>
              )}

              <MenuItem
                icon={pinned ? PinOff : Icons.profilePin}
                label={pinned ? 'Unpin from profile' : 'Pin to profile'}
                onClick={togglePin}
              />
              <Separator />

              <MenuItem
                icon={Icons.delete}
                label='Delete'
                className='text-primary-red focus:text-primary-red'
                onClick={() => {
                  setOpenDeleteDialog(true);
                  setMenuOpen(false);
                }}
              />
            </Fragment>
          )}
          <Separator />
          <MenuItem
            icon={Icons.copyLink}
            label='Copy link'
            onClick={handleCopyLink}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </Fragment>
  );
};

export default PostActionMenu;
