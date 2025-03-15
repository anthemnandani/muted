'use client';

import { Tabs, TabsContent } from '@/components/ui/tabs';
import type { UserProfileContentProps } from '@/lib/types';
import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import NewCollection from '../modals/NewCollection';
import ProfileFilters from './ProfileFilters';
import ProfileTabsHeader from './ProfileTabsHeader';
import UserCollectionsList from './UserCollectionsList';
import UserLikedPostsList from './UserLikedPostsList';
import UserPostsList from './UserPostsList';
import UserRepostsList from './UserRepostsList';

const UserProfileContent: React.FC<UserProfileContentProps> = ({
  posts,
  userId,
  fetchNextPage,
  selectedFilter,
  setSelectedFilter,
  hasNextPage,
  username,
}) => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('posts');

  const isOwner = user?.id === userId;

  return (
    <div className='flex flex-[1_1_auto] justify-start items-start min-h-[490px] h-full min-w-0 relative'>
      <div className='w-full'>
        <Tabs defaultValue='posts' className='w-full'>
          <div className='flex-between w-full'>
            <div className='flex-1'>
              <ProfileTabsHeader
                isOwner={isOwner}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>
            {activeTab === 'posts' && (
              <div className='ml-4'>
                <ProfileFilters
                  selectedFilter={selectedFilter}
                  setSelectedFilter={setSelectedFilter}
                />
              </div>
            )}
            {activeTab === 'collections' && (
              <div className='ml-4'>
                <NewCollection showTrigger />
              </div>
            )}
          </div>

          <TabsContent value='posts' className='w-full'>
            <UserPostsList
              posts={posts}
              username={username}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
            />
          </TabsContent>
          <TabsContent value='reposts' className='w-full'>
            <UserRepostsList username={username} />
          </TabsContent>
          <TabsContent value='liked' className='w-full'>
            <UserLikedPostsList username={username} />
          </TabsContent>
          <TabsContent value='collections' className='w-full'>
            <UserCollectionsList username={username} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfileContent;
