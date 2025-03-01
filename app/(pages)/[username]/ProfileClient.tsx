'use client';

import NotFound from '@/app/not-found';
import UserProfile from '@/components/profile/UserProfile';
import UserProfileContent from '@/components/profile/UserProfileContent';
import ProfileHeaderSkeleton from '@/components/skeletons/ProfileHeaderSkeleton';
import SkeletonGrid from '@/components/skeletons/SkeletonGrid';
import type { ProfileFilter } from '@/lib/types';
import { api } from '@/trpc/react';
import { useState } from 'react';

const ProfileClient = ({ username }: { username: string }) => {
  const [selectedFilter, setSelectedFilter] = useState<ProfileFilter>('LATEST');
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.user.userInfo.useInfiniteQuery(
      { username, sortBy: selectedFilter },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
      }
    );

  if (isError) return <NotFound />;

  const allPosts = data?.pages.flatMap((page) => page.userDetails.posts);

  const userDetails = data?.pages.flatMap((page) => page.userDetails);

  return (
    <div className='main-container'>
      <div className='flex flex-col flex-[1_1_auto]'>
        {isLoading ? (
          <ProfileHeaderSkeleton />
        ) : (
          <UserProfile {...userDetails![0]} />
        )}

        {isLoading ? (
          <SkeletonGrid />
        ) : (
          <UserProfileContent
            username={username}
            posts={allPosts!}
            userId={userDetails![0].id}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
          />
        )}
      </div>
    </div>
  );
};

export default ProfileClient;
