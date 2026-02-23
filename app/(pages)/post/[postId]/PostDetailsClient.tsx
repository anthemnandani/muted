'use client';

import EmptyState from '@/components/shared/EmptyState';
import PostDetailsLayout from '@/components/shared/PostDetailsLayout';
import PostDetailsSkeleton from '@/components/skeletons/PostDetailsSkeleton';
import { OptimisticActionProvider } from '@/contexts/OptimisticActionContext';
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
    },
  );

  if (isError) {
    return (
      <div className='flex-center w-full h-screen'>
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

  if (isLoading || !data?.post) {
    return <PostDetailsSkeleton />;
  }

  return (
    <main className='flex w-full h-screen bg-[#121212] overflow-hidden md:pl-[90px]'>
      <OptimisticActionProvider
        target={{ type: QUERY_TYPE.POST_DETAILS, variables: { id: postId } }}
      >
        <PostDetailsLayout post={data.post} isModal />
      </OptimisticActionProvider>
    </main>
  );
};

export default PostDetailsClient;
