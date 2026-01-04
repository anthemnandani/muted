'use client';

import { Tabs, TabsContent } from '@/components/ui/tabs';
import {
  OptimisticActionProvider,
  type TargetType,
} from '@/contexts/OptimisticActionContext';
import { QUERY_TYPE } from '@/lib/constants';
import { type Tab, UserProfileContentProps } from '@/lib/types';
import usePostStore from '@/store/postStore';
import { useTabStore } from '@/store/tabStore';
import { useUser } from '@clerk/nextjs';
import { useMemo } from 'react';
import { Icons } from '../icons';
import NewCollection from '../modals/NewCollection';
import PostDetailDialog from '../modals/PostDetailDialog';
import EmptyState from '../shared/EmptyState';
import ProfileFilters from './ProfileFilters';
import ProfileTabsHeader from './ProfileTabsHeader';
import UserCollectionsList from './UserCollectionsList';
import UserLikedPostsList from './UserLikedPostsList';
import UserPostsList from './UserPostsList';
import UserRepostsList from './UserRepostsList';

const BlockedContent = () => (
  <EmptyState
    icon={<Icons.userLock className='size-11 text-white/90' />}
    title='No content'
    description="You've blocked this user and unable to view this user's posts."
  />
);

const PrivateContent = () => (
  <EmptyState
    icon={<Icons.userLock className='size-11 text-white/90' />}
    title='This account is private'
    description='Follow this account to see their contents and likes.'
  />
);

const UserProfileContent: React.FC<UserProfileContentProps> = ({
  userId,
  privacy,
  isFollower,
  username,
  isBlocked,
}) => {
  const { user } = useUser();
  const { activeTab, setActiveTab } = useTabStore();
  const { selectedFilter, setSelectedFilter } = usePostStore();

  const isOwner = user?.id === userId;
  const shouldShowPrivateContent =
    privacy === 'PRIVATE' && !isOwner && !isFollower;

  const target = useMemo(() => {
    switch (activeTab) {
      case 'posts':
        return {
          type: QUERY_TYPE.USER_POSTS,
          variables: { username, sortBy: selectedFilter },
        };
      case 'reposts':
        return { type: QUERY_TYPE.USER_REPOSTS, variables: { username } };
      case 'liked':
        return { type: QUERY_TYPE.USER_LIKED, variables: { username } };
    }
  }, [username, activeTab]);

  return (
    <OptimisticActionProvider target={target as TargetType}>
      <div className='flex flex-[1_1_auto] justify-start items-start min-h-[490px] h-full min-w-0 relative'>
        <div className='w-full'>
          <Tabs
            defaultValue={activeTab}
            className='w-full'
            onValueChange={(value) => setActiveTab(value as Tab)}
          >
            <div className='flex-between w-full'>
              <div>
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
              {isBlocked ? (
                <BlockedContent />
              ) : shouldShowPrivateContent ? (
                <PrivateContent />
              ) : (
                <UserPostsList username={username} filter={selectedFilter} />
              )}
            </TabsContent>

            <TabsContent value='reposts' className='w-full'>
              {isBlocked ? (
                <BlockedContent />
              ) : shouldShowPrivateContent ? (
                <PrivateContent />
              ) : (
                <UserRepostsList username={username} />
              )}
            </TabsContent>

            <TabsContent value='liked' className='w-full'>
              {isBlocked ? (
                <BlockedContent />
              ) : shouldShowPrivateContent ? (
                <PrivateContent />
              ) : (
                <UserLikedPostsList username={username} />
              )}
            </TabsContent>

            <TabsContent value='collections' className='w-full'>
              {isBlocked ? (
                <BlockedContent />
              ) : shouldShowPrivateContent ? (
                <PrivateContent />
              ) : (
                <UserCollectionsList username={username} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <PostDetailDialog />
    </OptimisticActionProvider>
  );
};

export default UserProfileContent;
