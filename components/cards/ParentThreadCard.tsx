'use client';

import { usePostInteraction } from '@/hooks/usePostInteraction';
import { ThreadProps } from '@/lib/types';
import { format } from 'date-fns';
import CopyLinkButton from '../buttons/CopyLinkButton';
import ThreadBookmarkButton from '../buttons/ThreadBookmarkButton';
import ThreadLikeButton from '../buttons/ThreadLikeButton';
import ThreadReplyButton from '../buttons/ThreadReplyButton';
import ThreadRepostButton from '../buttons/ThreadRepostButton';
import ThreadCardBase from './ThreadCardBase';

const ParentThreadCard = ({ postInfo }: { postInfo: ThreadProps }) => {
  const { createdAt, repliesCount, hideLikes } = postInfo;
  const time = format(createdAt, 'h:mm a');
  const date = format(createdAt, 'MMM d, yyyy');
  const { isLoading: isCheckingPermissions, canInteract } = usePostInteraction({
    authorId: postInfo.author.id,
    privacy: postInfo.privacy,
    mentions: postInfo.mentions,
  });

  return (
    <div className='flex flex-col w-full pt-2'>
      <article className='pt-4'>
        <div className='flex flex-col w-full mb-4'>
          <ThreadCardBase {...postInfo} variant='default' showActions={false}>
            <div className='mt-1 flex items-center space-x-2 py-2 text-[15px] text-white/50 px-2 md:px-4'>
              <p>{time}</p>
              <div className='size-1 rounded-full bg-white/50'></div>
              <p>{date}</p>
            </div>
            <div className='flex items-center space-x-6 border-t border-b border-border-light py-3 px-2 md:px-4'>
              <div>
                <span className='font-medium'>{repliesCount}</span>{' '}
                <span className='text-white/50'>
                  comment{repliesCount !== 1 ? 's' : ''}
                </span>
              </div>
              <div>
                <span className='font-medium'>{postInfo.repostsCount}</span>{' '}
                <span className='text-gray-3'>
                  repost{postInfo.repostsCount !== 1 ? 's' : ''}
                </span>
              </div>
              {!hideLikes && (
                <div>
                  <span className='font-medium'>{postInfo.likesCount}</span>{' '}
                  <span className='text-white/50'>
                    like{postInfo.likesCount !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </ThreadCardBase>

          <div className='flex-around border-b border-border-light py-3'>
            <ThreadLikeButton
              likeInfo={{
                id: postInfo.id,
                likesCount: postInfo.likesCount ?? 0,
                likes: postInfo.likes,
              }}
              authorId={postInfo.author.id}
              isParentThread
            />

            <ThreadReplyButton
              replyThreadInfo={{
                id: postInfo.id,
                text: postInfo.text,
                author: postInfo.author,
                media: postInfo.media,
                createdAt: postInfo.createdAt,
                privacy: postInfo.privacy,
                mentions: postInfo.mentions,
                isComment: true,
              }}
              repliesCount={repliesCount}
              canInteract={canInteract}
              isParentThread
            />

            <ThreadRepostButton
              id={postInfo.id}
              text={postInfo.text}
              author={postInfo.author}
              createdAt={postInfo.createdAt}
              reposts={postInfo.reposts}
              repostsCount={postInfo.repostsCount}
              media={postInfo.media}
              linkPreview={postInfo.linkPreview}
              mentions={postInfo.mentions}
              quoteId={postInfo.quoteId}
              isCheckingPermissions={isCheckingPermissions}
              canInteract={canInteract}
              isParentThread
            />

            <ThreadBookmarkButton
              bookmarkInfo={{
                id: postInfo.id,
                bookmarksCount: postInfo.bookmarksCount ?? 0,
                bookmarks: postInfo.bookmarks,
              }}
              isParentThread
            />

            <CopyLinkButton
              postId={postInfo.id}
              username={postInfo.author.username}
            />
          </div>

          {repliesCount > 0 && (
            <div className='mt-6 mb-2 font-semibold text-[15px] leading-none px-2 md:px-4'>
              Replies
            </div>
          )}
        </div>
      </article>
    </div>
  );
};

export default ParentThreadCard;
