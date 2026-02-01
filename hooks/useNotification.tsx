import { useNotificationStore } from '@/store/notificationStore';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { useCallback, useEffect } from 'react';

const useNotification = () => {
  const { user } = useUser();
  const {
    unreadCount,
    setUnreadCount,
    followRequestsCount,
    setFollowRequestsCount,
    isNotificationOpen,
    setIsNotificationOpen,
  } = useNotificationStore();

  const { data: unreadData } = api.notification.getUnreadCount.useQuery(
    undefined,
    {
      enabled: !!user,
      trpc: { abortOnUnmount: true },
      staleTime: 10 * 60 * 1000,
    },
  );

  const { data: followRequestData } =
    api.notification.getFollowRequestsCount.useQuery(undefined, {
      enabled: !!user,
      trpc: { abortOnUnmount: true },
      staleTime: 10 * 60 * 1000,
    });

  const { mutate: markAllAsRead } = api.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      setUnreadCount(0);
    },
  });

  useEffect(() => {
    if (unreadData) {
      setUnreadCount(unreadData.unreadCount);
    }
  }, [unreadData, setUnreadCount]);

  useEffect(() => {
    if (followRequestData) {
      setFollowRequestsCount(followRequestData.followRequestsCount);
    }
  }, [followRequestData, setFollowRequestsCount]);

  const toggleNotificationSidebar = useCallback(() => {
    const newState = !isNotificationOpen;
    setIsNotificationOpen(newState);

    if (newState && unreadCount > 0) {
      markAllAsRead();
    }
  }, [isNotificationOpen, setIsNotificationOpen, markAllAsRead, unreadCount]);

  return {
    unreadCount,
    followRequestsCount,
    isNotificationOpen,
    toggleNotificationSidebar,
  };
};

export default useNotification;
