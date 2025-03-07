'use client';

import usePostNavigator from '@/hooks/usePostNavigator';
import { PostCardProps } from '@/lib/types';
import React from 'react';
import { useInView } from 'react-intersection-observer';
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
  index,
  totalPosts,
}) => {
  const { setPostNavigation } = usePostNavigator();
  const { ref, inView } = useInView({
    threshold: 0.6,
  });

  React.useEffect(() => {
    if (inView && index !== undefined && totalPosts !== undefined) {
      setPostNavigation(index, totalPosts);
    }
  }, [inView, index, totalPosts, setPostNavigation]);

  return (
    <div ref={ref} className='h-screen flex-center' data-post-index={index}>
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
