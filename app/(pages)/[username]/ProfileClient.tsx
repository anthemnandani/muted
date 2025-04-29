'use client';

import NotFound from '@/app/not-found';
import BlockedUserContent from '@/components/profile/BlockedUserContent';
import UserProfile from '@/components/profile/UserProfile';
import UserProfileContent from '@/components/profile/UserProfileContent';
import ProfileHeaderSkeleton from '@/components/skeletons/ProfileHeaderSkeleton';
import SkeletonGrid from '@/components/skeletons/SkeletonGrid';
import usePostStore from '@/store/postStore';
import useVideoPlayer from '@/store/videoPlayer';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { useEffect, useMemo } from 'react';

const ProfileClient = ({ username }: { username: string }) => {
  const { user } = useUser();
  const { selectedFilter, setSelectedFilter } = usePostStore();
  const { setCurrentlyPlaying } = useVideoPlayer();
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.user.userInfo.useInfiniteQuery(
      { username, sortBy: selectedFilter },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
      }
    );

  useEffect(() => {
    setCurrentlyPlaying(null);
  }, []);

  if (isError) return <NotFound />;

  const allPosts = data?.pages.flatMap((page) => page.userDetails.posts);

  const userDetails = data?.pages.flatMap((page) => page.userDetails);

  const isBlockedByMe = useMemo(
    () =>
      userDetails?.[0].blockedByUsers?.some(
        (blockedUser) => blockedUser.blockingUserId === user?.id
      ),
    [userDetails, user]
  );

  const hasBlockedMe = useMemo(
    () =>
      userDetails?.[0].blockedUsers?.some(
        (blockedUser) => blockedUser.blockedUserId === user?.id
      ),
    [userDetails, user]
  );

  if (isLoading)
    return (
      <div className='main-container'>
        <div className='flex flex-col flex-[1_1_auto]'>
          <ProfileHeaderSkeleton />
          <SkeletonGrid />
        </div>
      </div>
    );

  if (hasBlockedMe) return <BlockedUserContent />;

  const enhancedUserDetails = {
    ...userDetails![0],
    isBlocked: isBlockedByMe ?? false,
  };

  return (
    <div className='main-container'>
      <div className='flex flex-col flex-[1_1_auto]'>
        <UserProfile {...enhancedUserDetails} />
        <UserProfileContent
          username={username}
          posts={allPosts!}
          userId={userDetails![0].id}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          isBlocked={isBlockedByMe ?? false}
        />
      </div>
    </div>
  );
};

export default ProfileClient;
