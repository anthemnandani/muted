'use client';

import Loading from '@/app/(pages)/loading';
import NotFound from '@/app/not-found';
import UserProfile from '@/components/profile/UserProfile';
import HeaderWrapper from '@/components/shared/HeaderWrapper';
import TopHeader from '@/components/shared/TopHeader';
import Wrapper from '@/components/shared/Wrapper';
import useDevice from '@/hooks/useDevice';
import { api } from '@/trpc/react';
import { useParams, usePathname } from 'next/navigation';

export default function ProfileFeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { username } = useParams<{ username: string }>();
  const pathname = usePathname();
  const { isMobile } = useDevice();

  const { data, isLoading, isError } = api.user.userInfo.useQuery({
    username: decodeURIComponent(username).substring(1),
  });

  if (isLoading) return <Loading />;
  if (isError) return <NotFound />;

  const isCollectionDetails = pathname.split('/collections/').length > 1;

  return (
    <>
      {!isMobile && !isCollectionDetails && (
        <HeaderWrapper>
          <TopHeader title='Profile' />
        </HeaderWrapper>
      )}

      {isCollectionDetails ? (
        children
      ) : (
        <Wrapper>
          <UserProfile {...data.userDetails} />
          {children}
        </Wrapper>
      )}
    </>
  );
}
