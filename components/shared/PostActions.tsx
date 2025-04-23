'use client';

import { PostActionsProps } from '@/lib/types';
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

      <BookmarkButton
        bookmarkInfo={{
          id,
          bookmarksCount: bookmarksCount!,
          bookmarks,
        }}
      />
      <SharePost id={id} reposts={reposts} repostsCount={repostsCount} />
    </div>
  );
};

export default PostActions;
