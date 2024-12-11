'use client';

import Loading from '@/app/(pages)/loading';
import NotFound from '@/app/not-found';
import { Icons } from '@/components/icons';
import SortFollowersAndFollowing from '@/components/menus/SortFollowersAndFollowing';
import ProfileTabItem from '@/components/shared/ProfileTabItem';
import { parseUsernamePath } from '@/lib/utils';
import { api } from '@/trpc/react';
import { useParams, usePathname, useRouter } from 'next/navigation';

interface FollowersAndFollowingLayoutProps {
  children: React.ReactNode;
}

export default function FollowersAndFollowingLayout({
  children,
}: FollowersAndFollowingLayoutProps) {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params.username).substring(1);
  const path = usePathname();
  const { basePath, lastSegment } = parseUsernamePath(path, params.username);

  const { data, isLoading, isError } = api.user.userInfo.useQuery({ username });

  if (isLoading) return <Loading />;
  if (isError) return <NotFound />;

  return (
    <>
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

        <SortFollowersAndFollowing />
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
    </>
  );
}
