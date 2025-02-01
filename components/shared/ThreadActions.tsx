'use client';

import { usePostInteraction } from '@/hooks/usePostInteraction';
import { ThreadActionsProps } from '@/lib/types';
import BookmarkButton from '../buttons/BookmarkButton';
import CopyLinkButton from '../buttons/CopyLinkButton';
import LikeButton from '../buttons/LikeButton';
import ReplyButton from '../buttons/ReplyButton';
import RepostButton from '../buttons/RepostButton';

interface ExtendedThreadActionsProps extends ThreadActionsProps {
  layout?: 'horizontal' | 'vertical';
}

const ThreadActions: React.FC<ExtendedThreadActionsProps> = ({
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
  const { isLoading: isCheckingPermissions, canInteract } = usePostInteraction({
    authorId: author.id,
    privacy,
    mentions,
  });

  const containerClass = 'flex flex-col gap-4 items-center';

  return (
    <div className={containerClass}>
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
          media,
          author,
          createdAt,
          privacy,
          mentions,
          linkPreview,
        }}
        repliesCount={repliesCount}
        isParentPost={isParentPost}
        canInteract={canInteract}
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
        isCheckingPermissions={isCheckingPermissions}
        canInteract={canInteract}
      />

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
  );
};

export default ThreadActions;
