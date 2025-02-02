'use client';
import { ThreadCardProps } from '@/lib/types';
import React from 'react';
import UserProfile from '../modals/UserProfile';
import ThreadActions from '../shared/ThreadActions';
import ThreadVideoCard from './ThreadVideoCard';
import ReplyButton from '../buttons/ReplyButton';
import LikeButton from '../buttons/LikeButton';
import BookmarkButton from '../buttons/BookmarkButton';
import ShareButton from '../buttons/ShareButton';

const ThreadCard: React.FC<ThreadCardProps> = ({
  isLastThread,
  showUsername,
  parentPost,
  variant = 'default',
  showMuted = true,
  media,
  id,
  author,
  likes,
  text,
  createdAt,
  repliesCount,
  reposts,
  repostsCount,
  bookmarks,
  bookmarksCount,
  privacy,
  mentions,
  linkPreview,
  hideLikes,
  likesCount,
  ...props
}) => {
  return (
    <div className='h-screen flex-center'>
      <article className='flex justify-center items-end gap-4'>
        <div className='w-full max-w-[calc((0px-2rem+100vh)*0.5625)] h-[calc(0px-2rem+100vh)] relative snap-center'>
          <ThreadVideoCard
            video={media?.fileUrl! as string}
            poster={media?.thumbnailUrl! as string}
            aspectRatio={media?.aspectRatio}
            originalDimensions={media?.originalDimensions}
            username={author?.username!}
            postId={id!}
          />
        </div>
        <div className='flex flex-col items-center gap-4'>
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
          <BookmarkButton
            bookmarkInfo={{
              id,
              bookmarksCount: bookmarksCount!,
              bookmarks,
            }}
            isParentPost
          />
          <ShareButton />
        </div>
      </article>
    </div>
  );
};

export default ThreadCard;
