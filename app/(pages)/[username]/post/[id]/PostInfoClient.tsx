'use client';

import Loading from '@/app/(pages)/loading';
import NotFound from '@/app/not-found';
import ThreadReplyCard from '@/components/cards/ThreadReplyCard';
import Wrapper from '@/components/shared/Wrapper';
import { api } from '@/trpc/react';

const PostInfoClient = ({ id }: { id: string }) => {
  const { data, isLoading, isError } = api.post.getNestedPosts.useQuery({ id });

  if (isLoading) return <Loading />;
  if (isError) return <NotFound />;
  console.log('Data: ', data);
  return data ? (
    <Wrapper>
      <ThreadReplyCard {...data} key={data.postInfo.id} />
    </Wrapper>
  ) : (
    <NotFound />
  );
};

export default PostInfoClient;
