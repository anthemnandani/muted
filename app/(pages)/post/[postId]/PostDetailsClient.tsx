'use client';

import PostCard from '@/components/cards/PostCard';
import EmptyState from '@/components/shared/EmptyState';
import PostCardSkeleton from '@/components/skeletons/PostCardSkeleton';
import { OptimisticLikeProvider } from '@/contexts/OptimisticLikeContext';
import { QUERY_TYPE } from '@/lib/constants';
import { api } from '@/trpc/react';
import { Video } from 'lucide-react';

const PostDetailsClient = ({ postId }: { postId: string }) => {
  const { data, isLoading, isError } = api.post.getPostDetails.useQuery(
    { id: postId },
    {
      staleTime: 10 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      trpc: { abortOnUnmount: true },
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  if (isError) {
    return (
      <div className='flex-center w-full h-full'>
        <div className='flex flex-col items-center text-center'>
          <EmptyState
            icon={<Video className='size-11 text-white/90' />}
            title='Post currently unavailable'
            description='Try exploring the latest posts or starting a new search.'
          />
        </div>
      </div>
    );
  }

  return (
    <div className='relative mx-auto my-0 w-full'>
      <OptimisticLikeProvider
        target={{ type: QUERY_TYPE.POST_DETAILS, variables: { id: postId } }}
      >
        {isLoading ? <PostCardSkeleton /> : <PostCard {...data.post} />}
      </OptimisticLikeProvider>
    </div>
  );
};

export default PostDetailsClient;
