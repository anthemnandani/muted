import { Tabs, TabsContent } from '@/components/ui/tabs';
import type { UserProfilePostsProps } from '@/lib/types';
import { useUser } from '@clerk/nextjs';
import ProfileFilters from './ProfileFilters';
import ProfileTabsHeader from './ProfileTabsHeader';
import UserPostsList from './UserPostsList';

const UserProfileContent = ({
  posts,
  userId,
}: {
  posts: UserProfilePostsProps;
  userId: string;
}) => {
  const { user } = useUser();

  const isOwner = user?.id === userId;

  return (
    <div className='flex flex-[1_1_auto] justify-start items-start min-h-[490px] min-w-0 relative'>
      <div className='flex-between w-full min-h-[46px] relative'>
        <Tabs defaultValue='posts' className='w-full'>
          <ProfileTabsHeader isOwner={isOwner} />

          <TabsContent value='posts'>
            <UserPostsList posts={posts} />
          </TabsContent>
        </Tabs>
        {/* <ProfileFilters /> */}
      </div>
    </div>
  );
};

export default UserProfileContent;
