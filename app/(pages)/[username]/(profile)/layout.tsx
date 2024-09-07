'use client';

import NotFound from '@/app/not-found';
import { api } from '@/trpc/react';
import { useParams } from 'next/navigation';
import Loading from '@/app/(pages)/loading';
import UserProfile from '@/components/user/UserDetails';
import Wrapper from '@/components/shared/Wrapper';

interface PagesLayoutProps {
  children: React.ReactNode;
}

export default function ProfileLayout({ children }: PagesLayoutProps) {
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params.username).substring(1);

  const { data, isLoading, isError } = api.user.userInfo.useQuery({ username });

  if (isLoading) return <Loading />;
  if (isError) return <NotFound />;

  return (
    <Wrapper>
      <UserProfile {...data.userDetails} />
      {children}
    </Wrapper>
  );
}
