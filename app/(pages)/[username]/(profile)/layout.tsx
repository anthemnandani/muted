'use client';

import Loading from '@/app/(pages)/loading';
import NotFound from '@/app/not-found';
import PinToHome from '@/components/menus/PinToHome';
import HeaderWrapper from '@/components/shared/HeaderWrapper';
import Wrapper from '@/components/shared/Wrapper';
import UserProfile from '@/components/user/UserDetails';
import useWindow from '@/hooks/useWindow';
import { api } from '@/trpc/react';
import { useParams } from 'next/navigation';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params.username).substring(1);
  const { isMobile } = useWindow();

  const { data, isLoading, isError } = api.user.userInfo.useQuery({ username });

  if (isLoading) return <Loading />;
  if (isError) return <NotFound />;

  return (
    <>
      {!isMobile && (
        <HeaderWrapper>
          <div className='flex-between h-[60px] px-4'>
            <span className='text-[15px] font-semibold flex-1 text-center'>
              Profile
            </span>
            <PinToHome />
          </div>
        </HeaderWrapper>
      )}

      <Wrapper>
        <UserProfile {...data.userDetails} />
        {children}
      </Wrapper>
    </>
  );
}
