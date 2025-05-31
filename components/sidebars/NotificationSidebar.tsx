'use client';

import useNotification from '@/hooks/useNotification';
import { NOTIFICATION_FILTERS } from '@/lib/constants';
import { useNotificationStore } from '@/store/notificationStore';
import NotificationButton from '../buttons/NotificationButton';
import AllNotifications from '../notifications/AllNotifications';
import CommentNotifications from '../notifications/CommentNotifications';
import FollowerNotifications from '../notifications/FollowerNotifications';
import LikeNotifications from '../notifications/LikeNotifications';
import MentionNotifications from '../notifications/MentionNotifications';
import SidebarWrapper from '../shared/SidebarWrapper';
import { ScrollArea } from '../ui/scroll-area';

const NotificationSidebar = () => {
  const { activeTab } = useNotificationStore();
  const { isNotificationOpen, toggleNotificationSidebar } = useNotification();

  return (
    <SidebarWrapper
      isOpen={isNotificationOpen}
      setIsOpen={() => toggleNotificationSidebar()}
      title='Notifications'
    >
      <div className='flex flex-col h-screen'>
        <div className='flex flex-wrap items-center w-full gap-2 sm:gap-3 px-4 py-2'>
          {NOTIFICATION_FILTERS.map((filter) => (
            <NotificationButton
              key={filter.id}
              id={filter.id}
              btnTitle={filter.label}
            />
          ))}
        </div>
        <ScrollArea className='flex-1 mt-3'>
          {activeTab === 'all' && <AllNotifications />}
          {activeTab === 'likes' && <LikeNotifications />}
          {activeTab === 'comments' && <CommentNotifications />}
          {activeTab === 'mentions' && <MentionNotifications />}
          {activeTab === 'followers' && <FollowerNotifications />}
        </ScrollArea>
      </div>
    </SidebarWrapper>
  );
};

export default NotificationSidebar;
