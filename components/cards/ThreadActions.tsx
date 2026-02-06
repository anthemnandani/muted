'use client';

import CopyLinkButton from '@/components/buttons/CopyLinkButton';
import ThreadBookmarkButton from '@/components/buttons/ThreadBookmarkButton';
import ThreadLikeButton from '@/components/buttons/ThreadLikeButton';
import ThreadReplyButton from '@/components/buttons/ThreadReplyButton';
import ThreadRepostButton from '@/components/buttons/ThreadRepostButton';
import { usePostInteraction } from '@/hooks/usePostInteraction';
import { ThreadActionsProps } from '@/lib/types';
import { Fragment } from 'react';

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
  parentId,
}) => {
  const { isLoading: isCheckingPermissions, canInteract } = usePostInteraction({
    authorId: author.id,
    privacy,
    mentions,
  });
  return (
    <Fragment>
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
            media,
            createdAt,
            privacy,
            mentions,
            isComment: !parentId,
          }}
          repliesCount={repliesCount}
          canInteract={canInteract}
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
          isCheckingPermissions={isCheckingPermissions}
          canInteract={canInteract}
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
    </Fragment>
  );
};

export default ThreadActions;
