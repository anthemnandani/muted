'use client';

import Error from '@/app/error';
import { Icons } from '@/components/icons';
import PostDetailDialog from '@/components/modals/PostDetailDialog';
import UserPostCard from '@/components/profile/UserPostCard';
import TopHeader from '@/components/shared/TopHeader';
import HeaderSkeleton from '@/components/skeletons/HeaderSkeleton';
import SkeletonGrid from '@/components/skeletons/SkeletonGrid';
import {
  OptimisticActionProvider,
  type TargetType,
} from '@/contexts/OptimisticActionContext';
import { QUERY_TYPE } from '@/lib/constants';
import usePostStore from '@/store/postStore';
import { api } from '@/trpc/react';
import { Fragment, useEffect, useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

const CollectionDetails = ({ id }: { id: string }) => {
  const { setPostList, setPagination } = usePostStore();

  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.collection.getCollection.useInfiniteQuery(
      { id },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        retry: false,
      }
    );

  const posts = data?.pages.flatMap((page) => page.posts);
  const collection = data?.pages[0].collection;

  const postsHash = useMemo(() => {
    return posts?.map((p) => `${p.id}-${p.likesCount}`).join('|');
  }, [posts]);

  const target = useMemo(() => {
    return { type: QUERY_TYPE.COLLECTION_POSTS, variables: { id } };
  }, [id]);

  useEffect(() => {
    if (!posts) return;

    setPostList(posts);
    setPagination(!!hasNextPage, fetchNextPage);
  }, [postsHash, hasNextPage, fetchNextPage]);

  if (isError) return <Error />;

  return (
    <div className='main-container'>
      {isLoading ? (
        <Fragment>
          <HeaderSkeleton />
          <SkeletonGrid />
        </Fragment>
      ) : posts?.length === 0 ? (
        <div className='flex-center w-full h-screen'>
          <p className='text-gray-3'>No posts found in this collection</p>
        </div>
      ) : (
        <OptimisticActionProvider target={target as TargetType}>
          <TopHeader title={collection?.name as string} />
          <InfiniteScroll
            dataLength={posts?.length ?? 0}
            next={fetchNextPage}
            hasMore={hasNextPage ?? false}
            className='w-full mt-6'
            loader={
              <div className='col-span-full flex-center py-10'>
                <Icons.loading className='size-11' />
              </div>
            }
          >
            <div className='main-grid'>
              {posts?.map((post, index) => (
                <UserPostCard
                  key={post.id}
                  media={post.media}
                  postId={post.id}
                  index={index}
                />
              ))}
            </div>
          </InfiniteScroll>
        </OptimisticActionProvider>
      )}
      <PostDetailDialog />
    </div>
  );
};

export default CollectionDetails;
