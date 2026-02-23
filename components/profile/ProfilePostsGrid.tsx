import { ProfilePostsGridProps } from '@/lib/types';
import usePostStore from '@/store/postStore';
import { useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Icons } from '../icons';
import EmptyState from '../shared/EmptyState';
import SkeletonGrid from '../skeletons/SkeletonGrid';
import UserPostCard from './UserPostCard';

const ProfilePostsGrid = ({
  posts,
  fetchNextPage,
  hasNextPage,
  title,
  description,
  isLoading,
  isError,
}: ProfilePostsGridProps) => {
  const { setPostList, setPagination } = usePostStore();

  useEffect(() => {
    if (posts.length === 0) return;

    setPostList(posts);
    setPagination(!!hasNextPage, fetchNextPage);
  }, [posts, hasNextPage, fetchNextPage]);

  if (isLoading) return <SkeletonGrid />;

  if (isError)
    return (
      <EmptyState
        title='Error loading posts'
        description='Please try again later'
      />
    );

  if (posts?.length === 0 && !isLoading) {
    return (
      <EmptyState
        icon={
          <div className='size-[92px] rounded-full flex-center bg-zinc-800'>
            <Icons.emptyPost className='size-11 text-white/90' />
          </div>
        }
        title={title}
        description={description}
      />
    );
  }

  return (
    <InfiniteScroll
      dataLength={posts?.length ?? 0}
      next={fetchNextPage}
      hasMore={hasNextPage ?? false}
      className='w-full mt-3'
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
            pinned={post.pinned}
            index={index}
          />
        ))}
      </div>
    </InfiniteScroll>
  );
};

export default ProfilePostsGrid;
