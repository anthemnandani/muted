'use client';

import useCopyLink from '@/hooks/useCopyLink';
import useTimeLeft from '@/hooks/useTimeLeft';
import useToggleHidePost from '@/hooks/useToggleHidePost';
import useToggleMuteUser from '@/hooks/useToggleMuteUser';
import useTogglePinPost from '@/hooks/useTogglePinPost';
import { PostActionMenuProps } from '@/lib/types';
import { cn, formatTimeLeft } from '@/lib/utils';
import { useMutedUsers } from '@/store/mutedUsers';
import useDialog from '@/store/postDialog';
import { useReportStore } from '@/store/reportStore';
import { useUser } from '@clerk/nextjs';
import { Edit, MoreHorizontal, PinOff } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import { Icons } from '../icons';
import BlockUser from '../modals/BlockUser';
import DeletePost from '../modals/DeletePost';
import MenuItem from '../shared/MenuItem';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../ui/hover-card';
import { Separator } from '../ui/separator';

const PostActionMenu: React.FC<PostActionMenuProps> = ({
  author,
  postId,
  createdAt,
  currentText,
  pinned,
  showControls,
}) => {
  const { user } = useUser();
  const { timeLeft } = useTimeLeft({ createdAt });
  const { setEditPostInfo, setOpenDialog } = useDialog();
  const { isMutedUser } = useMutedUsers();
  const [menuOpen, setMenuOpen] = useState(false);
  const { openPostReport } = useReportStore();

  const { handleTogglePinPost, isLoading: isLoadingPinPost } = useTogglePinPost(
    {
      postId,
      isPinned: pinned!,
    }
  );

  const { handleToggleHidePost, isLoading: isLoadingHidePost } =
    useToggleHidePost({
      postId,
    });

  const { handleToggleMuteUser, isLoading: isLoadingMuteUser } =
    useToggleMuteUser({
      userId: author.id,
    });

  const { handleCopyLink } = useCopyLink({ postId, username: author.username });

  useEffect(() => {
    if (timeLeft <= 0) {
      setEditPostInfo(null);
    }
  }, [timeLeft, setEditPostInfo]);

  return (
    <HoverCard open={menuOpen} onOpenChange={setMenuOpen}>
      <HoverCardTrigger asChild>
        <div
          className={cn(
            'relative h-12 flex-center cursor-pointer transition-all duration-200 drop-shadow-lg',
            'group',
            'before:content-[""] before:absolute before:size-10 before:rounded-full before:bg-white-13 before:scale-0 before:transition-transform before:duration-200',
            'hover:before:scale-100',
            showControls ? 'opacity-100' : 'opacity-0'
          )}
        >
          <MoreHorizontal className='aspect-square object-cover object-center size-6 overflow-hidden flex-1 text-white z-10' />
        </div>
      </HoverCardTrigger>

      <HoverCardContent
        align='end'
        className='w-[200px] p-2 bg-black/85 border-none rounded-xl'
      >
        {user?.id !== author.id ? (
          <Fragment>
            <MenuItem
              icon={Icons.notInterested}
              label='Not interested'
              onClick={() => handleToggleHidePost({ postId })}
              disabled={isLoadingHidePost}
            />
            <Separator />
            <MenuItem
              icon={Icons.mute}
              label={isMutedUser(author.id) ? 'Unmute' : 'Mute'}
              onClick={() => handleToggleMuteUser({ userId: author.id })}
              disabled={isLoadingMuteUser}
            />
            <Separator />
            <BlockUser
              username={author.username}
              userId={author.id}
              closeMenu={() => setMenuOpen(false)}
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
                  onClick={() => {
                    setEditPostInfo({ id: postId, text: currentText });
                    setOpenDialog(true);
                  }}
                />
                <Separator />
              </Fragment>
            )}

            <MenuItem
              icon={pinned ? PinOff : Icons.profilePin}
              label={pinned ? 'Unpin from profile' : 'Pin to profile'}
              onClick={handleTogglePinPost}
              disabled={isLoadingPinPost}
            />
            <Separator />

            <DeletePost postId={postId} />
          </Fragment>
        )}
        <Separator />
        <MenuItem
          icon={Icons.copyLink}
          label='Copy link'
          onClick={handleCopyLink}
        />
      </HoverCardContent>
    </HoverCard>
  );
};

export default PostActionMenu;
