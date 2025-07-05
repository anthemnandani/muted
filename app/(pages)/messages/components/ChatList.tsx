'use client';

import ChatListSkeleton from '@/components/skeletons/ChatListSkeleton';
import { useChatContext } from '@/contexts/ChatContext';
import { Chat, ChatUser } from '@/lib/types';
import { cn } from '@/lib/utils';
import useChatStore from '@/store/chatStore';
import { useUser } from '@clerk/nextjs';
import { MessageCircle, Search } from 'lucide-react';
import { useCallback, useState } from 'react';
import ChatListItem from './ChatListItem';
import ChatSearchInput from './ChatSearchInput';

const ChatList = ({
  onMessageRequestsClick,
}: {
  onMessageRequestsClick?: () => void;
}) => {
  const { chatsLoading } = useChatContext();
  const { currentChat, chats, messageRequestsCount } = useChatStore();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');

  const getOtherUser = useCallback(
    (chat: Chat): ChatUser | null => {
      if (!chat.participants || !user?.id) return null;
      return chat.participants.find((p) => p.id !== user.id) || null;
    },
    [user?.id]
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

  const hasMessageRequests = messageRequestsCount > 0;

  return (
    <div className='flex flex-col h-full'>
      <ChatSearchInput
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className='flex-1 overflow-y-auto'>
        {hasMessageRequests && (
          <div
            className={cn(
              'flex items-center p-4 cursor-pointer transition-all duration-200',
              'hover:bg-white/5'
            )}
            onClick={onMessageRequestsClick}
          >
            <div className='relative mr-3 flex-shrink-0'>
              <div className='size-12 bg-[#57608a] rounded-full flex-center'>
                <MessageCircle className='size-6 text-white/80' />
              </div>
            </div>

            <div className='flex-1 min-w-0'>
              <div className='flex-between'>
                <div className='flex flex-col gap-1'>
                  <h3 className='font-semibold text-white/90'>
                    Message requests
                  </h3>
                  <p className='text-white/60 text-sm'>
                    You have{' '}
                    {messageRequestsCount > 9 ? '9+' : messageRequestsCount}{' '}
                    request
                    {messageRequestsCount > 1 ? 's' : ''}
                  </p>
                </div>
                <span
                  className={cn(
                    'bg-red-500 text-white/90 text-[14px]',
                    'rounded-full ml-2 size-[22px] flex-center'
                  )}
                >
                  {messageRequestsCount > 9 ? '9+' : messageRequestsCount}
                </span>
              </div>
            </div>
          </div>
        )}

        {filteredChats.length === 0 && !hasMessageRequests ? (
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

            return (
              <ChatListItem
                chat={chat}
                isSelected={isSelected}
                otherUser={otherUser}
                key={chat.id}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;
