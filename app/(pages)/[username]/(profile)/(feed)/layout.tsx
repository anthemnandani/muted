'use client';

import Loading from '@/app/(pages)/loading';
import NotFound from '@/app/not-found';
import UserProfile from '@/components/profile/UserProfile';
import Wrapper from '@/components/shared/Wrapper';
import { api } from '@/trpc/react';
import { useParams, usePathname } from 'next/navigation';

interface ProfileFeedLayoutProps {
  children: React.ReactNode;
}

export default function ProfileFeedLayout({
  children,
}: ProfileFeedLayoutProps) {
  const params = useParams<{ username: string }>();
  const pathname = usePathname();
  const username = decodeURIComponent(params.username).substring(1);

  const { data, isLoading, isError } = api.user.userInfo.useQuery({ username });

  const hideProfile = pathname.split('/bookmarks/').length > 1;

  if (isLoading) return <Loading />;
  if (isError) return <NotFound />;

  return (
    <>
      {!hideProfile ? (
        <Wrapper>
          <UserProfile {...data.userDetails} />
          {children}
        </Wrapper>
      ) : (
        children
      )}
    </>
  );
}
