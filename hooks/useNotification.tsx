import { useNotificationStore } from '@/store/notificationStore';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { useCallback, useEffect } from 'react';

interface UseNotificationReturn {
  unreadCount: number;
  isNotificationOpen: boolean;
  toggleNotificationSidebar: () => void;
}

const useNotification = (): UseNotificationReturn => {
  const { user } = useUser();
  const {
    unreadCount,
    setUnreadCount,
    isNotificationOpen,
    setIsNotificationOpen,
  } = useNotificationStore();

  const { data: unreadData } = api.notification.getUnreadCount.useQuery(
    undefined,
    {
      //   refetchInterval: 30000,
      enabled: !!user,
      trpc: { abortOnUnmount: true },
      staleTime: 10 * 60 * 1000,
    }
  );

  const { mutate: markAllAsRead } =
    api.notification.markAllAsRead.useMutation();

  useEffect(() => {
    if (unreadData) {
      setUnreadCount(unreadData.unreadCount);
    }
  }, [unreadData, setUnreadCount]);

  const toggleNotificationSidebar = useCallback(() => {
    const newState = !isNotificationOpen;
    setIsNotificationOpen(newState);

    // Todo: Improve this
    if (newState) {
      markAllAsRead();
      setTimeout(() => {
        setUnreadCount(0);
      }, 2500);
    }
  }, [
    isNotificationOpen,
    setIsNotificationOpen,
    markAllAsRead,
    setUnreadCount,
  ]);

  return {
    unreadCount,
    isNotificationOpen,
    toggleNotificationSidebar,
  };
};

export default useNotification;
