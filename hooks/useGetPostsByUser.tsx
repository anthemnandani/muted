import Error from '@/app/error';
import NotFound from '@/app/not-found';
import Loader from '@/components/shared/Loader';
import { api } from '@/trpc/react';

const useGetPostsByUser = ({ username }: { username: string }) => {
  const { data, isLoading, isError } = api.user.userPosts.useQuery({
    username,
  });

  if (isLoading) return <Loader />;
  if (isError) return <Error />;
  if (!isLoading && !data) return <NotFound />;

  return data?.posts;
};

export default useGetPostsByUser;
