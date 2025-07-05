'use client';

import ChatListSkeleton from '@/components/skeletons/ChatListSkeleton';
import { useChatContext } from '@/contexts/ChatContext';
import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import ChatListItem from './ChatListItem';
import ChatSearchInput from './ChatSearchInput';
import useChatStore from '@/store/chatStore';

const MessageRequests = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { chatsLoading } = useChatContext();
  const { currentChat, messageRequests } = useChatStore();
  const { user } = useUser();

  const filteredRequests = messageRequests.filter((request) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const sender = request.participants.find((p) => p.id !== user?.id);
    return (
      sender?.fullName?.toLowerCase().includes(searchLower) ||
      sender?.username.toLowerCase().includes(searchLower)
    );
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
        {filteredRequests.map((request) => {
          const isSelected = currentChat?.id === request.id;
          const sender = request.participants.find((p) => p.id !== user?.id);
          if (!sender) return null;

          return (
            <ChatListItem
              isSelected={isSelected}
              otherUser={sender}
              chat={request}
              key={request.id}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MessageRequests;
