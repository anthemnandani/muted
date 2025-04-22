'use client';

import { PostActionsProps } from '@/lib/types';
import { useUser } from '@clerk/nextjs';
import BookmarkButton from '../buttons/BookmarkButton';
import LikeButton from '../buttons/LikeButton';
import ReplyButton from '../buttons/ReplyButton';
import SharePost from '../modals/SharePost';
import UserProfile from '../modals/UserProfile';

const PostActions: React.FC<PostActionsProps> = ({
  id,
  likesCount,
  likes,
  author,
  repliesCount,
  hideLikes,
  reposts,
  repostsCount,
  bookmarks,
  bookmarksCount,
  onCommentsToggle,
}) => {
  const { user } = useUser();
  return (
    <div className='flex flex-col items-center justify-end'>
      <UserProfile author={author} />
      <LikeButton
        likeInfo={{
          id,
          likesCount: likesCount!,
          likes: likes!,
        }}
        hideLikes={hideLikes}
      />
      <ReplyButton
        repliesCount={repliesCount}
        canInteract
        onCommentsToggle={onCommentsToggle}
      />
      {/* {user?.id !== author.id && (
        <RepostButton id={id} reposts={reposts} repostsCount={repostsCount} />
      )} */}
      <BookmarkButton
        bookmarkInfo={{
          id,
          bookmarksCount: bookmarksCount!,
          bookmarks,
        }}
      />
      <SharePost id={id} reposts={reposts} />
    </div>
  );
};

export default PostActions;
