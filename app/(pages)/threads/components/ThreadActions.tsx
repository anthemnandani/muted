'use client';

import CopyLinkButton from '@/components/buttons/CopyLinkButton';
import ThreadBookmarkButton from '@/components/buttons/ThreadBookmarkButton';
import ThreadLikeButton from '@/components/buttons/ThreadLikeButton';
import ThreadReplyButton from '@/components/buttons/ThreadReplyButton';
import ThreadRepostButton from '@/components/buttons/ThreadRepostButton';
import { AuthorInfoProps, Bookmark, PostMedia } from '@/lib/types';
import { LinkPreview, PostPrivacy } from '@prisma/client';

interface ThreadActionsProps {
  id: string;
  privacy: PostPrivacy;
  likesCount: number;
  likes: { userId: string }[];
  text: string | null;
  author: AuthorInfoProps;
  createdAt: Date;
  repliesCount: number;
  reposts?: { userId: string; postId: string }[];
  repostsCount: number;
  bookmarks: Bookmark[];
  bookmarksCount: number;
  media?: PostMedia[];
  linkPreview?: LinkPreview | null;
  mentions: Array<{
    user: AuthorInfoProps;
    index: number;
  }>;
  hideLikes: boolean;
  isParentPost?: boolean;
}

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
        <ThreadLikeButton
          likeInfo={{
            id,
            likesCount,
            likes,
          }}
          hideLikes={hideLikes}
          isParentPost={isParentPost}
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
          reposts={reposts!}
          repostsCount={repostsCount}
          isParentPost={isParentPost}
          media={media!}
          linkPreview={linkPreview!}
          mentions={mentions}
        />
      </div>

      <div className='flex items-center gap-5'>
        <ThreadBookmarkButton
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
