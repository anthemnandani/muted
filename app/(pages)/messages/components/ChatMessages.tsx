'use client';

import ChatSkeleton from '@/components/skeletons/ChatSkeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSocket } from '@/contexts/SocketContext';
import useChatMessages from '@/hooks/useChatMessages';
import { TYPING_EVENT } from '@/lib/socket-events';
import { Message } from '@/lib/types';
import { useEffect, useRef, useState } from 'react';
import EmptyMessageState from './EmptyMessageState';

const ChatMessages: React.FC<{ messages: Message[]; chatLoading: boolean }> = ({
  messages,
  chatLoading,
}) => {
  const { socket } = useSocket();
  const [otherPersonTyping, setOtherPersonTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: 'auto' | 'smooth' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom('smooth');
    }
  }, [messages]);

  useEffect(() => {
    if (socket) {
      socket.on(TYPING_EVENT, (data) => {
        setOtherPersonTyping(data.isTyping);
      });
    }

    return () => {
      socket?.off(TYPING_EVENT);
    };
  }, [socket]);

  if (chatLoading) {
    return <ChatSkeleton />;
  }

  const { renderMessage } = useChatMessages(messages);

  return (
    <ScrollArea
      ref={messagesContainerRef}
      className='flex-1 flex flex-col px-4'
    >
      {messages.length === 0 ? (
        <EmptyMessageState />
      ) : (
        <div className='space-y-1'>
          {messages.map((message, index) => renderMessage(message, index))}

          {otherPersonTyping && (
            <div className='flex justify-start mb-4'>
              <div className='flex items-center space-x-2 px-4 py-3 bg-white/10 border border-white/10 rounded-2xl rounded-bl-md'>
                <div className='size-2 bg-white/60 rounded-full animate-bounce'></div>
                <div
                  className='size-2 bg-white/60 rounded-full animate-bounce'
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className='size-2 bg-white/60 rounded-full animate-bounce'
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}
    </ScrollArea>
  );
};

export default ChatMessages;
