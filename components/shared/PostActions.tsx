'use client';

import { PostActionsProps } from '@/lib/types';
import BookmarkButton from '../buttons/BookmarkButton';
import LikeButton from '../buttons/LikeButton';
import ReplyButton from '../buttons/ReplyButton';
import ShareButton from '../buttons/ShareButton';
import UserProfile from '../modals/UserProfile';
import RepostButton from '../buttons/RepostButton';

const PostActions: React.FC<PostActionsProps> = ({
  id,
  likesCount,
  likes,
  text,
  author,
  createdAt,
  repliesCount,
  hideLikes,
  media,
  reposts,
  repostsCount,
  linkPreview,
  mentions,
  bookmarks,
  bookmarksCount,
  privacy,
}) => {
  return (
    <div className='flex flex-col items-center justify-end gap-4'>
      <UserProfile author={author} />
      <LikeButton
        likeInfo={{
          id,
          likesCount: likesCount!,
          likes: likes!,
        }}
        hideLikes={hideLikes}
        isParentPost
      />
      <ReplyButton
        replyThreadInfo={{
          id,
          text,
          media,
          author,
          createdAt,
          privacy,
          mentions,
          linkPreview,
        }}
        repliesCount={repliesCount}
        isParentPost
        canInteract
      />
      <RepostButton id={id} reposts={reposts} repostsCount={repostsCount} />
      <BookmarkButton
        bookmarkInfo={{
          id,
          bookmarksCount: bookmarksCount!,
          bookmarks,
        }}
      />
      <ShareButton />
    </div>
  );
};

export default PostActions;
