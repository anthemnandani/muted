'use client';

import useNotification from '@/hooks/useNotification';
import { cn } from '@/lib/utils';
import { useSearchStore } from '@/store/searchStore';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Icons } from '../icons';
import NewPost from '../modals/NewPost';
import MenuLink from './MenuLink';
import { useChat } from '@/contexts/ChatContext';

const Navigation = () => {
  const { isSearchOpen, setIsSearchOpen } = useSearchStore();
  const { unreadCount, isNotificationOpen, toggleNotificationSidebar } =
    useNotification();
  const pathname = usePathname();
  const { user } = useUser();
  const { chats, messageRequestsCount } = useChat();

  const totalUnreadMessages = chats.reduce(
    (total, chat) => total + chat.unreadCount,
    0
  );

  const totalUnreadMsgsAndRequests = totalUnreadMessages + messageRequestsCount;

  useEffect(() => {
    if (isSearchOpen) {
      setIsSearchOpen(false);
    }
  }, [pathname]);

  return (
    <ul className='flex flex-col items-center gap-4 w-full'>
      <MenuLink
        route='/'
        icon={Icons.home}
        isActive={pathname === '/' && !isSearchOpen}
        addFill
      />
      <button
        type='button'
        title='Search'
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        className={cn(
          'flex-center size-12 transition-all duration-150',
          isSearchOpen
            ? 'bg-[#1f1f1f] rounded-full'
            : 'hover:bg-primary rounded-xl'
        )}
      >
        <Icons.search
          className={cn(
            'size-6 transition-colors duration-150',
            isSearchOpen ? 'text-foreground' : 'text-secondary'
          )}
        />
      </button>
      <NewPost />
      <MenuLink
        route='/following'
        icon={Icons.following}
        isActive={pathname === '/following' && !isSearchOpen}
      />
      <MenuLink
        route='/friends'
        icon={Icons.friends}
        isActive={pathname === '/friends' && !isSearchOpen}
      />
      <button
        onClick={toggleNotificationSidebar}
        className={cn(
          'relative flex-center size-12 transition-all duration-150',
          isNotificationOpen
            ? 'bg-[#1f1f1f] rounded-full'
            : 'hover:bg-primary rounded-xl'
        )}
      >
        {unreadCount > 0 ? (
          <Icons.activityWithCircle
            className={cn(
              'size-[30px] transition-colors duration-150',
              isNotificationOpen ? 'text-white/90' : 'text-secondary'
            )}
            fill={isNotificationOpen ? 'currentColor' : 'none'}
          />
        ) : (
          <Icons.activity
            className={cn(
              'size-[30px] transition-colors duration-150',
              isNotificationOpen ? 'text-white/90' : 'text-secondary'
            )}
            fill={isNotificationOpen ? 'currentColor' : 'none'}
          />
        )}
      </button>
      <div className='relative'>
        <MenuLink
          route='/messages'
          icon={Icons.messages}
          isActive={pathname === '/messages' && !isSearchOpen}
          addFill
        />
        {totalUnreadMsgsAndRequests > 0 && (
          <span className='absolute -top-1 -right-1 bg-red-500 text-white/90 text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] flex-center font-medium'>
            {totalUnreadMsgsAndRequests > 99
              ? '99+'
              : totalUnreadMsgsAndRequests}
          </span>
        )}
      </div>
      <MenuLink
        route={`/@${user?.username}`}
        icon={Icons.profile}
        isActive={!!pathname?.match(/^\/@\w+$/) && !isSearchOpen}
        addFill
      />
    </ul>
  );
};

export default Navigation;
