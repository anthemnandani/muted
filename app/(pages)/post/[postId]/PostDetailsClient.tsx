'use client';

import NotFound from '@/app/not-found';
import PostCard from '@/components/cards/PostCard';
import EmptyState from '@/components/shared/EmptyState';
import PostCardSkeleton from '@/components/skeletons/PostCardSkeleton';
import useGetPostsByType from '@/hooks/useGetPostsByType';
import useCommentPanelStore from '@/store/commentPanel';
import usePostStore from '@/store/postStore';
import { api } from '@/trpc/react';
import { Video } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

const PostDetailsClient = ({ postId }: { postId: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get('q')?.trim();
  const searchQueryRef = useRef<string | undefined>(searchQuery);
  const pathname = usePathname();
  const { resetState, storedPathname, openPanel } = useCommentPanelStore();

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

  const shouldFetchSinglePost = !profileUsername;

  const {
    data: singlePostData,
    isLoading: isLoadingSinglePost,
    isError: isSinglePostError,
  } = api.post.getPostDetails.useQuery(
    { id: postId },
    {
      enabled: shouldFetchSinglePost,
      staleTime: 10 * 60 * 1000,
      retry: false,
    }
  );

  const {
    data: userPosts,
    isLoading: isLoadingPosts,
    isError,
    isBlocked,
  } = useGetPostsByType({
    postType,
    username: profileUsername!,
    sortBy: selectedFilter,
    query: searchQuery,
    collectionId,
  });

  const posts = shouldFetchSinglePost
    ? singlePostData?.post
      ? [singlePostData.post]
      : []
    : userPosts;

  const isLoading = shouldFetchSinglePost
    ? isLoadingSinglePost
    : isLoadingPosts;

  const hasError = shouldFetchSinglePost ? isSinglePostError : isError;

  useEffect(() => {
    if (storedPathname === pathname) {
      openPanel(postId);
    }
  }, [storedPathname, pathname, postId]);

  useEffect(() => {
    return () => {
      resetState();
    };
  }, [resetState]);

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
      if (shouldFetchSinglePost) {
        setCurrentIndex(0);
        activeIndexRef.current = 0;
        hasScrolledRef.current = true;
        setInitialized(true);
      } else {
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

      const newUrl = searchQueryRef.current
        ? `/post/${post.id}?q=${encodeURIComponent(searchQueryRef.current)}`
        : `/post/${post.id}`;

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

  if (isBlocked) {
    return (
      <div className='flex-center w-full h-screen'>
        <EmptyState
          icon={<Video className='size-11 text-white/90' />}
          title='Post currently unavailable'
        />
      </div>
    );
  }

  if (hasError) return <NotFound />;

  if (isLoading) {
    return <PostCardSkeleton />;
  }

  if (!posts || posts.length === 0) {
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
        scrollSnapType: shouldFetchSinglePost ? 'none' : 'y mandatory',
        overflowY: 'auto',
        height: '100vh',
      }}
    >
      {posts.map((post) => (
        <div
          key={post.id}
          style={{
            scrollSnapAlign: shouldFetchSinglePost ? 'none' : 'start',
            scrollSnapStop: shouldFetchSinglePost ? 'normal' : 'always',
          }}
        >
          <PostCard {...post} />
        </div>
      ))}
    </div>
  );
};

export default PostDetailsClient;
