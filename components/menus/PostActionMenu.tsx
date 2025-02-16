'use client';

import useCopyLink from '@/hooks/useCopyLink';
import useHideLikes from '@/hooks/useHideLikes';
import useToggleHidePost from '@/hooks/useToggleHidePost';
import useToggleMuteUser from '@/hooks/useToggleMuteUser';
import { PostActionMenuProps } from '@/lib/types';
import { cn, formatTimeLeft } from '@/lib/utils';
import { useMutedUsers } from '@/store/mutedUsers';
import useDialog from '@/store/postDialog';
import { useUser } from '@clerk/nextjs';
import { Edit, MoreHorizontal } from 'lucide-react';
import React from 'react';
import { Icons } from '../icons';
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
  hideLikes,
  showControls,
}) => {
  const { user } = useUser();
  const [timeLeft, setTimeLeft] = React.useState<number>(0);
  const { setEditPostInfo, setOpenDialog } = useDialog();
  const { isMutedUser } = useMutedUsers();

  const { handleToggleHideLikes, isLoading } = useHideLikes({
    postId,
    hideLikes,
  });

  const { handleToggleHidePost, isLoading: isLoadingHidePost } =
    useToggleHidePost({
      postId,
    });

  const { handleToggleMuteUser, isLoading: isLoadingMuteUser } =
    useToggleMuteUser({
      userId: author.id,
    });

  const { handleCopyLink } = useCopyLink({ postId, username: author.username });

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
    <HoverCard>
      <HoverCardTrigger asChild>
        <div
          className={cn(
            // 'relative hover:before:content-[""] hover:before:absolute hover:before:bg-primary hover:before:z-[2] hover:before:-inset-2 hover:before:rounded-full cursor-pointer transition-opacity duration-200',
            'relative h-10 flex-center cursor-pointer transition-opacity duration-200 drop-shadow-lg',
            showControls ? 'opacity-100' : 'opacity-0'
          )}
        >
          <MoreHorizontal className='aspect-square object-cover object-center size-6 overflow-hidden flex-1 text-white' />
        </div>
      </HoverCardTrigger>

      <HoverCardContent
        align='end'
        className='w-[200px] p-2 bg-black/85 border-none rounded-xl'
      >
        {user?.id !== author.id ? (
          <React.Fragment>
            <MenuItem
              icon={Icons.notInterested}
              label='Not interested'
              onClick={() => handleToggleHidePost({ postId })}
              disabled={isLoadingHidePost}
              isActionMenuItem
            />
            <Separator />
            <MenuItem
              icon={Icons.mute}
              label={isMutedUser(author.id) ? 'Unmute' : 'Mute'}
              onClick={() => handleToggleMuteUser({ userId: author.id })}
              disabled={isLoadingMuteUser}
              isActionMenuItem
            />
            <Separator />
            <MenuItem
              icon={Icons.block}
              label='Block'
              className='text-primary-red focus:text-primary-red'
              isActionMenuItem
            />
            <Separator />
            <MenuItem
              icon={Icons.report}
              label='Report'
              className='text-primary-red focus:text-primary-red'
              isActionMenuItem
            />
          </React.Fragment>
        ) : (
          <React.Fragment>
            {timeLeft > 0 && (
              <>
                <MenuItem
                  icon={Edit}
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
                <Separator />
              </>
            )}

            <MenuItem
              icon={Icons.profilePin}
              label='Pin to profile'
              isActionMenuItem
            />
            <Separator />
            <MenuItem
              icon={Icons.hide}
              label={hideLikes ? 'Unhide like counts' : 'Hide like counts'}
              onClick={handleToggleHideLikes}
              disabled={isLoading}
              isActionMenuItem
            />

            <Separator />
            <DeletePost postId={postId} />
          </React.Fragment>
        )}
        <Separator />
        <MenuItem
          icon={Icons.copyLink}
          label='Copy link'
          onClick={handleCopyLink}
          isActionMenuItem
        />
      </HoverCardContent>
    </HoverCard>
  );
};

export default PostActionMenu;
