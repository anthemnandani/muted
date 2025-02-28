'use client';
import { PostCardProps } from '@/lib/types';
import React from 'react';
import BookmarkButton from '../buttons/BookmarkButton';
import LikeButton from '../buttons/LikeButton';
import ReplyButton from '../buttons/ReplyButton';
import ShareButton from '../buttons/ShareButton';
import UserProfile from '../modals/UserProfile';
import PostMediaCarousel from '../posts/PostMediaCarousel';

const PostCard: React.FC<PostCardProps> = ({
  media,
  id,
  author,
  likes,
  text,
  createdAt,
  repliesCount,
  bookmarks,
  bookmarksCount,
  privacy,
  mentions,
  linkPreview,
  hideLikes,
  likesCount,
  pinned,
}) => {
  return (
    <div className='h-screen flex-center'>
      <article className='flex justify-center items-end gap-4'>
        <PostMediaCarousel
          media={media}
          author={author}
          createdAt={createdAt}
          postId={id!}
          text={text}
          hideLikes={hideLikes}
          pinned={pinned}
        />
        <div className='flex flex-col items-center justify-end gap-4'>
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
          />
          <ShareButton />
        </div>
      </article>
    </div>
  );
};

export default PostCard;
