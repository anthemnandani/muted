import type { UserProfilePostsProps } from '@/lib/types';
import UserPostCard from './UserPostCard';

const UserPostsList = ({ posts }: { posts: UserProfilePostsProps }) => {
  return (
    <div
      className='
      w-full grid gap-y-6 gap-x-4 
      grid-cols-[repeat(auto-fit,minmax(200px,1fr))]
      xl:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]
      2xl:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] mt-6'
    >
      {posts.map((post) => (
        <UserPostCard key={post.id} media={post.media} />
      ))}
    </div>
  );
};

export default UserPostsList;
