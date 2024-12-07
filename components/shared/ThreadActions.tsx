'use client';

import { ThreadActionsProps } from '@/lib/types';
import BookmarkButton from '../buttons/BookmarkButton';
import CopyLinkButton from '../buttons/CopyLinkButton';
import LikeButton from '../buttons/LikeButton';
import ReplyButton from '../buttons/ReplyButton';
import RepostButton from '../buttons/RepostButton';

const ThreadActions: React.FC<ThreadActionsProps> = ({
  id,
  likesCount,
  likes,
  text,
  author,
  createdAt,
  repliesCount,
  reposts,
  repostsCount,
  hideLikes,
  media,
  linkPreview,
  mentions,
  bookmarks,
  bookmarksCount,
  privacy,
  isParentPost = false,
}) => {
  return (
    <>
      <div className='flex items-center gap-5'>
        <LikeButton
          likeInfo={{
            id,
            likesCount,
            likes,
          }}
          hideLikes={hideLikes}
          isParentPost={isParentPost}
        />

        <ReplyButton
          replyThreadInfo={{
            id,
            text,
            media: null,
            author,
            createdAt,
          }}
          repliesCount={repliesCount}
          isParentPost={isParentPost}
        />
        <RepostButton
          id={id}
          text={text}
          author={author}
          createdAt={createdAt}
          reposts={reposts}
          repostsCount={repostsCount}
          isParentPost={isParentPost}
          media={media}
          linkPreview={linkPreview}
          mentions={mentions}
          privacy={privacy}
        />
      </div>

      <div className='flex items-center gap-5'>
        <BookmarkButton
          bookmarkInfo={{
            id,
            bookmarksCount,
            bookmarks,
          }}
          isParentPost={isParentPost}
        />
        <CopyLinkButton postId={id} username={author.username} />
      </div>
    </>
  );
};

export default ThreadActions;
