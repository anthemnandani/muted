'use client';

import NotFound from '@/app/not-found';
import BlockedUserContent from '@/components/profile/BlockedUserContent';
import DeletedUserContent from '@/components/profile/DeletedUserContent';
import UserProfile from '@/components/profile/UserProfile';
import UserProfileContent from '@/components/profile/UserProfileContent';
import ProfileHeaderSkeleton from '@/components/skeletons/ProfileHeaderSkeleton';
import SkeletonGrid from '@/components/skeletons/SkeletonGrid';
import usePostStore from '@/store/postStore';
import useVideoPlayer from '@/store/videoPlayer';
import { api } from '@/trpc/react';
import { useEffect } from 'react';

const ProfileClient = ({ username }: { username: string }) => {
  const { reset } = usePostStore();
  const { setCurrentlyPlaying } = useVideoPlayer();

  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = api.user.getUserProfile.useQuery(
    { username },
    {
      retry: false,
      cacheTime: 10 * 60 * 1000,
      staleTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    setCurrentlyPlaying(null);
    return () => reset();
  }, [reset, setCurrentlyPlaying]);

  if (isLoading) {
    return (
      <div className='main-container'>
        <div className='flex flex-col flex-[1_1_auto]'>
          <ProfileHeaderSkeleton />
          <SkeletonGrid />
        </div>
      </div>
    );
  }

  if (isError) {
    if (error.data?.code === 'NOT_FOUND') return <DeletedUserContent />;
    return (
      <div className='content-center'>
        <NotFound />
      </div>
    );
  }

  if (profile.hasBlockedMe) return <BlockedUserContent />;

  return (
    <div className='main-container'>
      <div className='flex flex-col flex-[1_1_auto]'>
        <UserProfile {...profile} isBlocked={profile.isBlockedByMe} />

        <UserProfileContent
          username={username}
          userId={profile.id}
          privacy={profile.privacy}
          isFollower={profile.isFollower}
          isBlocked={profile.isBlockedByMe}
        />
      </div>
    </div>
  );
};

export default ProfileClient;
