'use client';

import NotFound from '@/app/not-found';
import UserProfile from '@/components/profile/UserProfile';
import UserProfileContent from '@/components/profile/UserProfileContent';
import { api } from '@/trpc/react';
import Loading from '../loading';

const ProfileClient = ({ username }: { username: string }) => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.user.userInfo.useInfiniteQuery(
      { username },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
      }
    );

  if (isLoading) return <Loading />;
  if (isError) return <NotFound />;

  const allPosts = data?.pages.flatMap((page) => page.userDetails.posts);

  const userDetails = data?.pages.flatMap((page) => page.userDetails);

  return (
    <div className='ml-[90px] 2xl:pl-[185px] lg:pl-[160px] w-[calc(100%-90px)] pr-3 max-w-[1800px] 2xl:mx-auto md:pt-8 pb-9 min-h-[calc(1px_+_100vh)]'>
      <div className='flex flex-col flex-[1_1_auto]'>
        <UserProfile {...userDetails[0]} />
        <UserProfileContent
          username={username}
          posts={allPosts}
          userId={userDetails[0].id}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
        />
      </div>
    </div>
  );
};

export default ProfileClient;
