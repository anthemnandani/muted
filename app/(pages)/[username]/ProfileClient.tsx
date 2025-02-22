'use client';

import NotFound from '@/app/not-found';
import UserProfile from '@/components/profile/UserProfile';
import { api } from '@/trpc/react';
import Loading from '../loading';

const ProfileClient = ({ username }: { username: string }) => {
  const { data, isLoading, isError } = api.user.userInfo.useQuery({
    username,
  });

  if (isLoading) return <Loading />;
  if (isError) return <NotFound />;

  return (
    <div
      className='container mx-auto px-4 
           md:pl-[96px] md:max-w-[900px] 
           lg:max-w-[1024px] 
           xl:max-w-[1200px] pt-8 pb-9 min-h-[calc(1px_+_100vh)]'
    >
      <div className='flex flex-col flex-[1_1_auto]'>
        <UserProfile {...data.userDetails} />
      </div>
    </div>
  );
};

export default ProfileClient;
