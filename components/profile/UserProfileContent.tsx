'use client';

import { Tabs, TabsContent } from '@/components/ui/tabs';
import type { UserProfileContentProps } from '@/lib/types';
import { useUser } from '@clerk/nextjs';
import ProfileFilters from './ProfileFilters';
import ProfileTabsHeader from './ProfileTabsHeader';
import UserPostsList from './UserPostsList';

const UserProfileContent: React.FC<UserProfileContentProps> = ({
  posts,
  userId,
  fetchNextPage,
  hasNextPage,
}) => {
  const { user } = useUser();

  const isOwner = user?.id === userId;

  return (
    <div className='flex flex-[1_1_auto] justify-start items-start min-h-[490px] min-w-0 relative'>
      <div className='w-full'>
        <Tabs defaultValue='posts' className='w-full'>
          <div className='flex justify-between items-center w-full'>
            <div className='flex-1'>
              <ProfileTabsHeader isOwner={isOwner} />
            </div>
            <div className='ml-4'>
              <ProfileFilters />
            </div>
          </div>

          <TabsContent value='posts' className='w-full'>
            <UserPostsList
              posts={posts}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfileContent;
