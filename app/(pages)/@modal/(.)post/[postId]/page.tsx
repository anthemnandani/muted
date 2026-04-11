'use client';

import PostDetailsLayout from '@/components/shared/PostDetailsLayout';
import PostDetailsSkeleton from '@/components/skeletons/PostDetailsSkeleton';
import {
  OptimisticActionProvider,
  type TargetType,
} from '@/contexts/OptimisticActionContext';
import { QUERY_TYPE } from '@/lib/constants';
import useSinglePostStore from '@/store/singlePostStore';
import { api } from '@/trpc/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

const SinglePostModal = ({ params }: { params: { postId: string } }) => {
  const { activePost, feedTarget } = useSinglePostStore();
  const router = useRouter();

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  const { data, isLoading } = api.post.getPostDetails.useQuery(
    { id: params.postId },
    {
      enabled: !activePost,
      staleTime: 10 * 60 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
    },
  );

  const post = activePost ?? data?.post ?? null;

  const target = feedTarget ?? {
    type: QUERY_TYPE.POST_DETAILS,
    variables: { id: params.postId },
  };

  if (!post) {
    return isLoading ? (
      <div className='fixed inset-0 z-[999] flex w-full h-screen max-w-full bg-[#121212]'>
        <PostDetailsSkeleton />
      </div>
    ) : null;
  }

  return (
    <div className='fixed inset-0 z-[999] flex w-full h-screen max-w-full bg-[#121212]'>
      <OptimisticActionProvider target={target as TargetType}>
        <PostDetailsLayout post={post} onClose={handleClose} isModal />
      </OptimisticActionProvider>
    </div>
  );
};

export default SinglePostModal;
