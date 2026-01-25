'use client';

import CopyLinkButton from '@/components/buttons/CopyLinkButton';
import ThreadBookmarkButton from '@/components/buttons/ThreadBookmarkButton';
import ThreadLikeButton from '@/components/buttons/ThreadLikeButton';
import ThreadReplyButton from '@/components/buttons/ThreadReplyButton';
import ThreadRepostButton from '@/components/buttons/ThreadRepostButton';
import { ThreadActionsProps } from '@/lib/types';

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
  quoteId,
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
        <ThreadLikeButton
          likeInfo={{
            id,
            likesCount,
            likes,
          }}
          hideLikes={hideLikes}
          authorId={author.id}
        />

        <ThreadReplyButton
          replyThreadInfo={{
            id,
            text,
            author,
            createdAt,
            privacy,
            mentions,
          }}
          repliesCount={repliesCount}
          isParentPost={isParentPost}
        />

        <ThreadRepostButton
          id={id}
          text={text}
          author={author}
          createdAt={createdAt}
          reposts={reposts}
          repostsCount={repostsCount}
          media={media}
          linkPreview={linkPreview}
          mentions={mentions}
          quoteId={quoteId}
        />
      </div>

      <div className='flex items-center gap-5'>
        <ThreadBookmarkButton
          bookmarkInfo={{
            id,
            bookmarksCount,
            bookmarks,
          }}
        />
        <CopyLinkButton threadId={id} />
      </div>
    </>
  );
};

export default ThreadActions;
