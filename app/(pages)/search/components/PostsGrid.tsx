import { Icons } from '@/components/icons';
import UserPostCard from '@/components/profile/UserPostCard';
import { PostsGridProps } from '@/lib/types';
import InfiniteScroll from 'react-infinite-scroll-component';

const PostsGrid = ({
  posts,
  fetchNextPage,
  hasNextPage,
  query,
}: PostsGridProps) => {
  return (
    <InfiniteScroll
      dataLength={posts!.length}
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
            likesCount={post.likesCount}
            text={post.text ?? ''}
            createdAt={post.createdAt}
            query={query}
            author={post.author}
            isSearch
          />
        ))}
      </div>
    </InfiniteScroll>
  );
};

export default PostsGrid;
