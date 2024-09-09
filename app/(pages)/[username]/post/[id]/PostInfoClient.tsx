'use client';

import Loading from '@/app/(pages)/loading';
import NotFound from '@/app/not-found';
import ThreadCard from '@/components/cards/ThreadCard';
import ThreadReplyCard from '@/components/cards/ThreadReplyCard';
import Wrapper from '@/components/shared/Wrapper';
import { ParentPostProps } from '@/lib/types';
import { api } from '@/trpc/react';

const ThreadRecursiveCard = ({
  post,
  isNested = false,
  isLastThread = false,
}: {
  post: ParentPostProps;
  isNested?: boolean;
  isLastThread?: boolean;
}) => {
  return (
    <>
      <ThreadCard
        {...post}
        isNested={isNested}
        showLine={post.replies && post.replies.length === 1}
        isLastThread={isLastThread}
      />
      {post.replies &&
        post.replies.length === 1 &&
        post.replies.map((reply: any, index: number) => (
          <ThreadRecursiveCard
            key={reply.id}
            post={reply}
            isNested
            isLastThread={index === post.replies.length - 1}
          />
        ))}
    </>
  );
};

const PostInfoClient = ({ id }: { id: string }) => {
  const { data, isLoading, isError } = api.post.getNestedPosts.useQuery({ id });
  if (isLoading) return <Loading />;
  if (isError) return <NotFound />;
  return data ? (
    <Wrapper>
      <ThreadReplyCard {...data} />
      {data.postInfo.replies.map((post: ParentPostProps, index: number) => (
        <ThreadRecursiveCard
          key={post.id}
          post={post}
          isLastThread={index === data.postInfo.replies.length - 1}
        />
      ))}
    </Wrapper>
  ) : null;
};

export default PostInfoClient;
