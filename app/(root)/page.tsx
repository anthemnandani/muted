import ThreadCard from '@/components/cards/ThreadCard';
import CreateWithInput from '@/components/inputs/CreateWithInput';
import Wrapper from '@/components/shared/Wrapper';
import { fetchPosts } from '@/lib/actions/thread.actions';
import { fetchUser } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default async function Page() {
  const user = await currentUser();
  if (!user) return null;
  const userInfo = await fetchUser(user.id);
  if (!userInfo) redirect('/onboarding');
  const { posts } = await fetchPosts(1, 30);

  return (
    <Wrapper>
      <div className='w-full sm:flex hidden'>
        <CreateWithInput />
      </div>
      <section className='flex flex-col gap-4 justify-start w-full mt-4'>
        {posts.map((post, index) => (
          <ThreadCard
            key={post._id}
            id={post._id}
            content={post.content}
            author={post.author}
            comments={post.children}
            currentUserId={user.id}
            parentId={post.parentId}
            createdAt={post.createdAt}
            community={post.community}
            isLastThread={posts.length === index + 1}
          />
        ))}
      </section>
    </Wrapper>
  );
}
