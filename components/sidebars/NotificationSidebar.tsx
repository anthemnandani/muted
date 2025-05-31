'use client';

import { NOTIFICATION_FILTERS } from '@/lib/constants';
import { useNotificationStore } from '@/store/notificationStore';
import NotificationButton from '../buttons/NotificationButton';
import SidebarWrapper from '../shared/SidebarWrapper';
import AllNotifications from '../notifications/AllNotifications';
import LikeNotifications from '../notifications/LikeNotifications';
import CommentNotifications from '../notifications/CommentNotifications';
import MentionNotifications from '../notifications/MentionNotifications';
import FollowerNotifications from '../notifications/FollowerNotifications';

const NotificationSidebar = () => {
  const { isNotificationOpen, setIsNotificationOpen, activeTab } =
    useNotificationStore();

  return (
    <SidebarWrapper
      isOpen={isNotificationOpen}
      setIsOpen={setIsNotificationOpen}
      title='Notifications'
    >
      <div className='flex flex-col h-full'>
        <div className='flex flex-wrap items-center w-full gap-2 sm:gap-3 px-4 py-2'>
          {NOTIFICATION_FILTERS.map((filter) => (
            <NotificationButton
              key={filter.id}
              id={filter.id}
              btnTitle={filter.label}
            />
          ))}
        </div>
        <div className='flex-1 overflow-auto mt-3'>
          {activeTab === 'all' && <AllNotifications />}
          {activeTab === 'likes' && <LikeNotifications />}
          {activeTab === 'comments' && <CommentNotifications />}
          {activeTab === 'mentions' && <MentionNotifications />}
          {activeTab === 'followers' && <FollowerNotifications />}
        </div>
      </div>
    </SidebarWrapper>
  );
};

export default NotificationSidebar;
