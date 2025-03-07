import Error from '@/app/error';
import NotFound from '@/app/not-found';
import { api } from '@/trpc/react';

const useGetPostById = ({ id }: { id: string }) => {
  const { data, isLoading, isError } = api.post.getPostDetails.useQuery({ id });

  if (isError) return <Error />;
  if (!isLoading && !data) return <NotFound />;

  return data?.post;
};

export default useGetPostById;
