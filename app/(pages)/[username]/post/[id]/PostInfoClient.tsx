'use client';

import Loading from '@/app/(pages)/loading';
import NotFound from '@/app/not-found';
import ThreadCard from '@/components/cards/ThreadCard';
import Wrapper from '@/components/shared/Wrapper';
import { api } from '@/trpc/react';

const PostInfoClient = ({ id }: { id: string }) => {
  const { data, isLoading, isError } = api.post.getNestedPosts.useQuery({ id });

  if (isLoading) return <Loading />;
  if (isError) return <NotFound />;
  return data ? (
    <Wrapper>
      <ThreadCard {...data.postInfo} className='pt-6' />
      {data.postInfo.replies.map((post, index) => (
        <ThreadCard
          key={post.id}
          {...post}
          isLastThread={index == data.postInfo.replies.length - 1}
        />
      ))}
    </Wrapper>
  ) : (
    <NotFound />
  );
};

export default PostInfoClient;
