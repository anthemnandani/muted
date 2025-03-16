'use client';

import { PostCardProps } from '@/lib/types';
import React from 'react';
import PostMediaCarousel from '../posts/PostMediaCarousel';
import PostActions from '../shared/PostActions';

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
  reposts,
  repostedBy,
  repostsCount,
  privacy,
  mentions,
  linkPreview,
  hideLikes,
  likesCount,
  pinned,
  index,
  totalPosts,
}) => {
  // const { setPostNavigation } = usePostNavigator();
  // const { ref, inView } = useInView({
  //   threshold: 0.6,
  // });

  // React.useEffect(() => {
  //   if (inView && index !== undefined && totalPosts !== undefined) {
  //     setPostNavigation(index, totalPosts);
  //   }
  // }, [inView, index, totalPosts, setPostNavigation]);

  return (
    // <div ref={ref} className='h-screen flex-center' data-post-index={index}>
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
          reposts={reposts}
          repostedBy={repostedBy}
        />
        <PostActions
          id={id}
          likesCount={likesCount ?? 0}
          likes={likes}
          text={text}
          author={author}
          createdAt={createdAt}
          repliesCount={repliesCount ?? 0}
          repostsCount={repostsCount ?? 0}
          reposts={reposts}
          media={media}
          linkPreview={linkPreview}
          mentions={mentions}
          hideLikes={hideLikes}
          bookmarksCount={bookmarksCount ?? 0}
          bookmarks={bookmarks}
          privacy={privacy}
        />
      </article>
    </div>
  );
};

export default PostCard;
