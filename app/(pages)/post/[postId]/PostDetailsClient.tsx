'use client';

import NotFound from '@/app/not-found';
import PostCard from '@/components/cards/PostCard';
import PostCardSkeleton from '@/components/skeletons/PostCardSkeleton';
import useGetPostsByType from '@/hooks/useGetPostsByType';
import usePostStore from '@/store/postStore';
import { useEffect, useRef } from 'react';

const PostDetailsClient = ({ postId }: { postId: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    currentIndex,
    currentPostId,
    profileUsername,
    postType,
    setInitialized,
    setCurrentPostId,
    setCurrentIndex,
    selectedFilter,
    collectionId,
  } = usePostStore();

  const isUpdatingUrlRef = useRef(false);
  const lastScrollTopRef = useRef(0);
  const activeIndexRef = useRef(currentIndex);
  const hasScrolledRef = useRef(false);

  const {
    data: userPosts,
    isLoading: isLoadingPosts,
    isError,
  } = useGetPostsByType({
    postType,
    username: profileUsername!,
    sortBy: selectedFilter,
    collectionId,
  });

  useEffect(() => {
    if (currentPostId !== postId && postId) {
      setCurrentPostId(postId);
    }
  }, [currentPostId, postId, setCurrentPostId]);

  useEffect(() => {
    if (
      !hasScrolledRef.current &&
      containerRef.current &&
      userPosts &&
      userPosts.length > 0
    ) {
      const index = userPosts.findIndex((post) => post.id === postId);

      if (index !== -1) {
        setCurrentIndex(index);
        activeIndexRef.current = index;

        containerRef.current.scrollTop = index * window.innerHeight;

        hasScrolledRef.current = true;
        setInitialized(true);
      } else {
        console.log('Post not found in user posts:', postId);
      }
    }
  }, [userPosts, postId, setInitialized, setCurrentIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !userPosts || userPosts.length === 0) return;

    const updateUrl = (index: number) => {
      if (isUpdatingUrlRef.current) return;

      const post = userPosts[index];
      if (!post) return;

      isUpdatingUrlRef.current = true;

      setCurrentPostId(post.id);
      setCurrentIndex(index);

      const newUrl = `/post/${post.id}`;
      window.history.replaceState(null, '', newUrl);

      setTimeout(() => {
        isUpdatingUrlRef.current = false;
      }, 50);
    };

    const handleScroll = () => {
      if (isUpdatingUrlRef.current) return;

      const scrollTop = container.scrollTop;

      if (Math.abs(scrollTop - lastScrollTopRef.current) < 50) return;
      lastScrollTopRef.current = scrollTop;

      const height = container.clientHeight;
      const index = Math.round(scrollTop / height);

      if (
        index !== activeIndexRef.current &&
        index >= 0 &&
        index < userPosts.length
      ) {
        activeIndexRef.current = index;
        updateUrl(index);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [userPosts, setCurrentPostId, setCurrentIndex]);

  if (isError) return <NotFound />;

  if (isLoadingPosts) {
    return <PostCardSkeleton />;
  }

  if (!userPosts || userPosts.length === 0) {
    return (
      <div className='flex-center w-full h-screen'>
        <p className='text-gray-3'>No post found</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className='hide-scrollbar'
      style={{
        scrollSnapType: 'y mandatory',
        overflowY: 'auto',
        height: '100vh',
      }}
    >
      {userPosts.map((post) => (
        <div
          key={post.id}
          style={{
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always',
          }}
        >
          <PostCard {...post} />
        </div>
      ))}
    </div>
  );
};

export default PostDetailsClient;
