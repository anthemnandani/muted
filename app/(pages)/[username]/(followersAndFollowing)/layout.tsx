'use client';

import NotFound from '@/app/not-found';
import { Icons } from '@/components/icons';
import SortFollowersAndFollowing from '@/components/menus/SortFollowersAndFollowing';
import Loader from '@/components/shared/Loader';
import ProfileTabItem from '@/components/shared/ProfileTabItem';
import Wrapper from '@/components/shared/Wrapper';
import useDevice from '@/hooks/useDevice';
import { parseUsernamePath } from '@/lib/utils';
import useSortBy from '@/store/sortBy';
import { api } from '@/trpc/react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { Fragment, useEffect } from 'react';

interface FollowersAndFollowingLayoutProps {
  children: React.ReactNode;
}

export default function FollowersAndFollowingLayout({
  children,
}: FollowersAndFollowingLayoutProps) {
  const router = useRouter();
  const { resetSortBy } = useSortBy();
  const { isMobile } = useDevice();
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params!.username).substring(1);
  const path = usePathname();
  const { basePath, lastSegment } = parseUsernamePath(
    path as string,
    params!.username
  );

  const { data, isLoading, isError } = api.user.userInfo.useQuery({ username });

  useEffect(() => {
    return () => {
      resetSortBy(username);
    };
  }, [username, resetSortBy]);

  if (isLoading) return <Loader />;
  if (isError) return <NotFound />;

  return (
    <Fragment>
      <main className='flex justify-center h-screen'>
        <section className='w-full'>
          <div className='w-full md:max-w-[550px] mx-auto relative'>
            <Wrapper>
              <div className='flex-between px-6 pt-8 pb-4'>
                <div className='flex items-center gap-4'>
                  <div className='cursor-pointer' onClick={() => router.back()}>
                    <Icons.back className='size-6' />
                  </div>
                  <div className='flex flex-col'>
                    <span className='text-lg font-medium'>
                      {data.userDetails.fullName}
                    </span>
                    <span className='text-sm text-muted-foreground'>
                      @{data.userDetails.username}
                    </span>
                  </div>
                </div>

                <SortFollowersAndFollowing username={username} />
              </div>
              <div className='w-full flex border-b border-border'>
                <ProfileTabItem
                  href={`/${basePath}/following`}
                  isActive={lastSegment === 'following'}
                  label='Following'
                />
                <ProfileTabItem
                  href={`/${basePath}/followers`}
                  isActive={lastSegment === 'followers'}
                  label='Followers'
                />
              </div>
              {children}
            </Wrapper>
          </div>
        </section>
      </main>
    </Fragment>
  );
}
