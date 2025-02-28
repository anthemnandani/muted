'use client';
import { usePostInteraction } from '@/hooks/usePostInteraction';
import { ParentThreadCardProps } from '@/lib/types';
import { format } from 'date-fns';
import React from 'react';
import BookmarkButton from '../buttons/BookmarkButton';
import CopyLinkButton from '../buttons/CopyLinkButton';
import LikeButton from '../buttons/LikeButton';
import ReplyButton from '../buttons/ReplyButton';
import RepostButton from '../buttons/RepostButton';
import ThreadCardBase from './ThreadCardBase';

const ParentThreadCard: React.FC<ParentThreadCardProps> = ({ postInfo }) => {
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
            <div className='mt-1 flex items-center space-x-2 py-2 text-[15px] text-gray-3 px-2 md:px-4'>
              <p>{time}</p>
              <div className='size-1 rounded-full bg-gray-3'></div>
              <p>{date}</p>
            </div>
            <div className='flex items-center space-x-6 border-t border-b border-border-dark dark:border-border-light py-3 px-2 md:px-4'>
              <div>
                <span className='font-medium'>{repliesCount}</span>{' '}
                <span className='text-gray-3'>
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
                  <span className='text-gray-3'>
                    like{postInfo.likesCount !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </ThreadCardBase>

          <div className='flex-around border-b border-border-dark dark:border-border-light py-3'>
            <LikeButton
              likeInfo={{
                id: postInfo.id,
                likesCount: postInfo.likesCount ?? 0,
                likes: postInfo.likes,
              }}
              isParentPost
            />

            <ReplyButton
              replyThreadInfo={{
                id: postInfo.id,
                text: postInfo.text,
                media: postInfo.media,
                linkPreview: postInfo.linkPreview,
                author: postInfo.author,
                privacy: postInfo.privacy,
                mentions: postInfo.mentions,
                createdAt: postInfo.createdAt,
              }}
              repliesCount={repliesCount}
              canInteract={canInteract}
              isParentPost
            />
            <RepostButton
              id={postInfo.id}
              text={postInfo.text}
              author={postInfo.author}
              createdAt={postInfo.createdAt}
              reposts={postInfo.reposts}
              repostsCount={postInfo.repostsCount ?? 0}
              media={postInfo.media}
              linkPreview={postInfo.linkPreview}
              mentions={postInfo.mentions}
              isParentPost
              isCheckingPermissions={isCheckingPermissions}
              canInteract={canInteract}
            />

            <BookmarkButton
              bookmarkInfo={{
                id: postInfo.id,
                bookmarksCount: postInfo.bookmarksCount ?? 0,
                bookmarks: postInfo.bookmarks,
              }}
              // isParentPost
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
