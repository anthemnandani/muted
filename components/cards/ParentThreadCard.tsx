'use client';

import { usePostInteraction } from '@/hooks/usePostInteraction';
import { ThreadProps } from '@/lib/types';
import ThreadBookmarkButton from '../buttons/ThreadBookmarkButton';
import ThreadLikeButton from '../buttons/ThreadLikeButton';
import ThreadReplyButton from '../buttons/ThreadReplyButton';
import ThreadRepostButton from '../buttons/ThreadRepostButton';
import ThreadCardBase from './ThreadCardBase';
import { ViewSource } from '@/generated/prisma/enums';

const ParentThreadCard = ({ threadInfo }: { threadInfo: ThreadProps }) => {
  const { repliesCount } = threadInfo;
  const { isLoading: isCheckingPermissions, canInteract } = usePostInteraction({
    authorId: threadInfo.author.id,
    privacy: threadInfo.privacy,
    mentions: threadInfo.mentions,
  });

  return (
    <div className='flex flex-col w-full pt-2'>
      <article className='pt-4'>
        <div className='flex flex-col w-full'>
          <ThreadCardBase
            {...threadInfo}
            variant='default'
            showActions={false}
            source={ViewSource.THREAD_DETAIL}
          >
            <div className='flex items-center space-x-6 border-b border-border-light pt-2 pb-4 px-2 md:px-4'>
              <ThreadLikeButton
                likeInfo={{
                  id: threadInfo.id,
                  likesCount: threadInfo.likesCount ?? 0,
                  likes: threadInfo.likes,
                }}
                authorId={threadInfo.author.id}
              />

              <ThreadReplyButton
                id={threadInfo.id}
                repliesCount={repliesCount}
              />
              <ThreadBookmarkButton
                bookmarkInfo={{
                  id: threadInfo.id,
                  bookmarksCount: threadInfo.bookmarksCount ?? 0,
                  bookmarks: threadInfo.bookmarks,
                }}
              />
              <ThreadRepostButton
                id={threadInfo.id}
                text={threadInfo.text}
                author={threadInfo.author}
                createdAt={threadInfo.createdAt}
                reposts={threadInfo.reposts}
                repostsCount={threadInfo.repostsCount}
                media={threadInfo.media}
                linkPreview={threadInfo.linkPreview}
                mentions={threadInfo.mentions}
                quoteId={threadInfo.quoteId}
                isCheckingPermissions={isCheckingPermissions}
                canInteract={canInteract}
              />
            </div>
          </ThreadCardBase>
        </div>
      </article>
    </div>
  );
};

export default ParentThreadCard;
