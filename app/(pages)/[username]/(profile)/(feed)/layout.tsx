'use client';

import Loading from '@/app/(pages)/loading';
import NotFound from '@/app/not-found';
import UserProfile from '@/components/profile/UserProfile';
import { api } from '@/trpc/react';
import { useParams } from 'next/navigation';

interface ProfileFeedLayoutProps {
  children: React.ReactNode;
}

export default function ProfileFeedLayout({
  children,
}: ProfileFeedLayoutProps) {
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params.username).substring(1);

  const { data, isLoading, isError } = api.user.userInfo.useQuery({ username });

  if (isLoading) return <Loading />;
  if (isError) return <NotFound />;

  return (
    <>
      <UserProfile {...data.userDetails} />
      {children}
    </>
  );
}
