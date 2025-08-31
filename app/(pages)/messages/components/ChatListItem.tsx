'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useChatContext } from '@/contexts/ChatContext';
import { useSocket } from '@/contexts/SocketContext';
import { ChatListItemParams } from '@/lib/types';
import { cn, formatMsgTime } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { BellOff } from 'lucide-react';
import { FC, Fragment, useCallback } from 'react';
import ChatMenu from './ChatMenu';
import useChatStore from '@/store/chatStore';

const ChatListItem: FC<ChatListItemParams> = ({
  chat,
  isSelected,
  otherUser,
}) => {
  const { user } = useUser();
  const hasUnread = chat.unreadCount > 0;
  const lastMessage = chat.lastMessage;
  const { handleSetCurrChat } = useChatContext();
  const { activeUsers } = useSocket();
  const { currentChat } = useChatStore();

  const isActive = useCallback(
    (userId: string): boolean => {
      return activeUsers.includes(userId);
    },
    [activeUsers]
  );

  const isOnline = isActive(otherUser.id);

  const isMuted =
    chat.isMuted || (chat.id === currentChat?.id && currentChat?.isMuted);

  return (
    <div
      key={chat.id}
      className={cn(
        'flex items-center justify-between p-4 transition-all duration-200 group',
        'hover:bg-white/5',
        isSelected && 'bg-white/10 border-l-4 border-l-primary-blue'
      )}
    >
      <div
        className='flex items-center flex-1 min-w-0 cursor-pointer'
        onClick={() => handleSetCurrChat(chat)}
      >
        <div className='relative mr-3 flex-shrink-0'>
          <Avatar className='size-12 rounded-full overflow-hidden'>
            <AvatarImage
              src={otherUser.image!}
              alt={otherUser.fullName || 'User'}
              width={48}
              height={48}
              className='object-cover w-full h-full'
            />
            <AvatarFallback className='flex-center'>
              {otherUser.username?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isOnline && (
            <div
              className={cn(
                'absolute bottom-0 right-0 size-3',
                'bg-green-500 border-2 border-black rounded-full'
              )}
            ></div>
          )}
        </div>

        <div className='flex-1 min-w-0'>
          <h3
            className={cn(
              'font-medium truncate text-white/90 mb-1',
              hasUnread && 'font-semibold'
            )}
          >
            {otherUser.fullName || otherUser.username}
          </h3>

          <div className='flex items-end'>
            <p
              className={cn(
                'text-sm text-white/75 overflow-hidden max-w-[60%] text-ellipsis whitespace-nowrap',
                hasUnread && 'font-medium text-white/80'
              )}
            >
              {lastMessage ? (
                <Fragment>
                  {lastMessage.sender?.id === user?.id && (
                    <span className='text-white/75'>You: </span>
                  )}
                  {lastMessage.content}
                </Fragment>
              ) : (
                <span className='text-white/75'>No messages yet</span>
              )}
            </p>

            {chat.lastMessageAt && (
              <span className='text-sm text-white/60 ml-1'>
                {formatMsgTime(chat.lastMessageAt)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className='relative flex-shrink-0 size-8'>
        {hasUnread && !chat.isMuted && (
          <span
            className={cn(
              'bg-red-500 text-white/90 text-[14px]',
              'rounded-full size-5 absolute inset-2 flex-center transition-opacity group-hover:opacity-0'
            )}
          >
            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
          </span>
        )}
        {isMuted && (
          <div className='absolute inset-0 flex-center transition-opacity group-hover:opacity-0'>
            <BellOff className='size-4 text-white/60' />
          </div>
        )}
        <div className='absolute inset-0 flex-center opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto'>
          <ChatMenu chatId={chat.id} isMuted={chat.isMuted!} />
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;
