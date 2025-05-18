import { Icons } from '@/components/icons';
import UserPostCard from '@/components/profile/UserPostCard';
import { ParentPostProps } from '@/lib/types';
import InfiniteScroll from 'react-infinite-scroll-component';

interface PostsGridProps {
  posts: ParentPostProps[];
  fetchNextPage: () => void;
  hasNextPage?: boolean;
}

const PostsGrid = ({ posts, fetchNextPage, hasNextPage }: PostsGridProps) => {
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
            username={post.author.username}
            media={post.media}
            postId={post.id}
            type='post'
            index={index}
            likesCount={post.likesCount}
            text={post.text ?? ''}
            createdAt={post.createdAt}
            author={post.author}
            isSearch
          />
        ))}
      </div>
    </InfiniteScroll>
  );
};

export default PostsGrid;
