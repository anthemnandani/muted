'use client';

import type { ThreadCardProps } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils';
import React, { useMemo, useState } from 'react';
import ReplyToggleButton from '../buttons/ReplyToggleButton';
import ThreadActionMenu from '../menus/ThreadActionMenu';
import UserProfile from '../modals/UserProfile';
import Line from '../shared/Line';
import ReplyThreadWrapper from '../shared/ReplyThreadWrapper';
import ThreadActions from '../shared/ThreadActions';
import { Separator } from '../ui/separator';
import RepostedBy from '../user/RepostedBy';
import Username from '../user/Username';
import ThreadQuoteCard from './ThreadQuoteCard';

const ChildReplyCard: React.FC<ThreadCardProps> = ({
  id,
  text,
  createdAt,
  author,
  likesCount,
  repostsCount,
  likes,
  reposts,
  bookmarksCount,
  bookmarks,
  repostedAt,
  children,
  repliesCount,
  repostedBy,
  quoteId,
}) => {
  const [showReplies, setShowReplies] = useState(false);

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const sortedChildren = useMemo(() => {
    if (!children) return [];
    return [...children].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [children]);

  return (
    <>
      <article className='w-full'>
        <div className='px-4 md:px-6 mb-3'>
          {repostedBy && (
            <RepostedBy repostedBy={repostedBy} repostedAt={repostedAt} />
          )}
          <div className='flex justify-between'>
            <div className='flex gap-4 w-full'>
              <div className='flex flex-col items-center'>
                <UserProfile author={author} />
                {sortedChildren.length > 0 && <Line />}
              </div>
              <div className='flex flex-col w-full'>
                <div className='flex-between gap-5 py-px w-full max-md:max-w-full max-md:flex-wrap'>
                  <div className='flex items-center gap-2'>
                    <Username author={author} />
                    <time className='text-[15px] leading-none text-gray-3'>
                      {formatTimeAgo(createdAt)}
                    </time>
                  </div>
                  <ThreadActionMenu
                    authorId={author.id}
                    postId={id}
                    repostedBy={repostedBy}
                  />
                </div>

                <div className='w-full'>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: text.replace(/\\n/g, '\n'),
                    }}
                    className='text-accent-foreground text-[15px] leading-5 mt-1 max-md:max-w-full whitespace-pre-line'
                  />
                </div>
                {quoteId && <ThreadQuoteCard quoteId={quoteId} />}

                <div className='-ml-2 flex items-center gap-3.5 pt-4'>
                  <ThreadActions
                    id={id}
                    likesCount={likesCount ?? 0}
                    likes={likes}
                    text={text}
                    author={author}
                    createdAt={createdAt}
                    repliesCount={repliesCount ?? 0}
                    repostsCount={repostsCount ?? 0}
                    reposts={reposts}
                    bookmarksCount={bookmarksCount ?? 0}
                    bookmarks={bookmarks}
                  />
                </div>
              </div>
            </div>
          </div>
          {sortedChildren.length > 0 && (
            <ReplyToggleButton
              showReplies={showReplies}
              repliesCount={repliesCount ?? 0}
              onClick={toggleReplies}
            />
          )}
        </div>
      </article>
      {showReplies && sortedChildren.length > 0 && (
        <div className='ml-12'>
          <div className='pb-4'>
            <Separator />
          </div>
          <ReplyThreadWrapper>
            {sortedChildren.map((reply) => (
              <ChildReplyCard key={reply.id} {...reply} />
            ))}
          </ReplyThreadWrapper>
        </div>
      )}
    </>
  );
};

export default ChildReplyCard;
