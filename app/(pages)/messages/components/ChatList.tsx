'use client';

import ChatListSkeleton from '@/components/skeletons/ChatListSkeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Chat, User } from '@/contexts/ChatContext';
import { useChat } from '@/contexts/ChatContext';
import { useSocket } from '@/contexts/SocketContext';
import { cn, formatMsgTime } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { Search } from 'lucide-react';
import { Fragment, useCallback, useState } from 'react';
import ChatSearchInput from './ChatSearchInput';

const ChatList = () => {
  const { currentChat, handleSetCurrChat, chats, chatsLoading } = useChat();
  const { activeUsers } = useSocket();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');

  const getOtherUser = useCallback(
    (chat: Chat): User | null => {
      if (!chat.participants || !user?.id) return null;
      return chat.participants.find((p) => p.id !== user.id) || null;
    },
    [user?.id]
  );

  const isActive = useCallback(
    (userId: string): boolean => {
      return activeUsers.includes(userId);
    },
    [activeUsers]
  );

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true;
    const otherUser = getOtherUser(chat);
    if (!otherUser) return false;
    const searchLower = searchQuery.toLowerCase();
    return otherUser.fullName?.toLowerCase().includes(searchLower);
  });

  if (chatsLoading) {
    return <ChatListSkeleton />;
  }

  return (
    <div className='flex flex-col h-full'>
      <ChatSearchInput
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className='flex-1 overflow-y-auto'>
        {filteredChats.length === 0 ? (
          <div className='flex-col-center h-64 px-4 text-center'>
            <div className='size-16 bg-white/5 rounded-full flex-center mb-4'>
              <Search className='size-8 text-white/20' />
            </div>
            <p className='text-white/50 font-medium'>
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            <p className='text-white/30 text-sm mt-1'>
              {searchQuery
                ? 'Try a different search term'
                : 'Start a conversation with your friends!'}
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const otherUser = getOtherUser(chat);
            if (!otherUser) return null;

            const isSelected = currentChat?.id === chat.id;
            const isOnline = isActive(otherUser.id);
            const hasUnread = chat.unreadCount > 0;
            const lastMessage = chat.lastMessage;

            return (
              <div
                key={chat.id}
                className={cn(
                  'flex items-center p-4 cursor-pointer transition-all duration-200',
                  'hover:bg-white/5',
                  isSelected && 'bg-white/10 border-l-4 border-l-primary-blue'
                )}
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
                  <div className='flex-between mb-1'>
                    <h3
                      className={`font-medium truncate text-white/90 ${
                        hasUnread ? 'font-semibold' : ''
                      }`}
                    >
                      {otherUser.fullName || otherUser.username}
                    </h3>
                    {chat.lastMessageAt && (
                      <span className='text-xs text-white/40 flex-shrink-0 ml-2'>
                        {formatMsgTime(chat.lastMessageAt)}
                      </span>
                    )}
                  </div>

                  <div className='flex-between'>
                    <p
                      className={`text-sm text-white/60 truncate ${
                        hasUnread ? 'font-medium text-white/80' : ''
                      }`}
                    >
                      {lastMessage ? (
                        <Fragment>
                          {lastMessage.sender.id === user?.id && (
                            <span className='text-white/40'>You: </span>
                          )}
                          {lastMessage.type === 'MEDIA'
                            ? '📷 Photo'
                            : lastMessage.content}
                        </Fragment>
                      ) : (
                        <span className='text-white/40'>No messages yet</span>
                      )}
                    </p>
                    {hasUnread && (
                      <span
                        className={cn(
                          'bg-red-500 text-white/90 text-xs',
                          'rounded-full px-2 py-1 ml-2 flex-shrink-0 min-w-[20px] text-center'
                        )}
                      >
                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;
