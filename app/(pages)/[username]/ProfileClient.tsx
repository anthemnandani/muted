'use client';

import NotFound from '@/app/not-found';
import UserProfile from '@/components/profile/UserProfile';
import UserProfileContent from '@/components/profile/UserProfileContent';
import { api } from '@/trpc/react';
import Loading from '../loading';

const ProfileClient = ({ username }: { username: string }) => {
  const { data, isLoading, isError } = api.user.userInfo.useQuery({
    username,
  });

  if (isLoading) return <Loading />;
  if (isError) return <NotFound />;

  return (
    <div className='ml-[90px] 2xl:pl-[185px] lg:pl-[160px] w-[calc(100%-90px)] pr-3 max-w-[1800px] 2xl:mx-auto md:pt-8 pb-9 min-h-[calc(1px_+_100vh)]'>
      <div className='flex flex-col flex-[1_1_auto]'>
        <UserProfile {...data.userDetails} />
        <UserProfileContent
          posts={data.userDetails.posts}
          userId={data.userDetails.id}
        />
      </div>
    </div>
  );
};

export default ProfileClient;
