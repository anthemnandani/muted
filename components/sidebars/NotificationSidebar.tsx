'use client';

import { NOTIFICATION_FILTERS } from '@/lib/constants';
import { useNotificationStore } from '@/store/notificationStore';
import NotificationButton from '../buttons/NotificationButton';
import SidebarWrapper from '../shared/SidebarWrapper';

const NotificationSidebar = () => {
  const { isNotificationOpen, setIsNotificationOpen } = useNotificationStore();

  return (
    <SidebarWrapper
      isOpen={isNotificationOpen}
      setIsOpen={setIsNotificationOpen}
      title='Notifications'
    >
      <div className='flex flex-wrap items-center w-full gap-2 sm:gap-3 mt-2 px-2'>
        {NOTIFICATION_FILTERS.map((filter) => (
          <NotificationButton
            key={filter.id}
            id={filter.id}
            btnTitle={filter.label}
          />
        ))}
      </div>
    </SidebarWrapper>
  );
};

export default NotificationSidebar;
