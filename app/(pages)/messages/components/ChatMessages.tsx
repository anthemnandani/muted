'use client';

import { Icons } from '@/components/icons';
import ChatSkeleton from '@/components/skeletons/ChatSkeleton';
import { useChatContext } from '@/contexts/ChatContext';
import { useSocket } from '@/contexts/SocketContext';
import useChatMessages from '@/hooks/useChatMessages';
import { TYPING_EVENT } from '@/lib/socket-events';
import useChatStore from '@/store/chatStore';
import { useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import EmptyMessageState from './EmptyMessageState';

const ChatMessages = () => {
  const { socket } = useSocket();
  const [otherPersonTyping, setOtherPersonTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages } = useChatStore();
  const { chatLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useChatContext();

  const { renderMessage } = useChatMessages({ messages });

  const prevMessagesLengthRef = useRef(messages.length);
  const prevLastMessageIdRef = useRef<string | null>(
    messages.length > 0 ? messages[messages.length - 1].id : null
  );

  const scrollToBottom = (behavior: 'auto' | 'smooth' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    const prevLength = prevMessagesLengthRef.current;
    const newLength = messages.length;
    const prevLastMessageId = prevLastMessageIdRef.current;
    const newLastMessageId = newLength > 0 ? messages[newLength - 1].id : null;

    const isInitialLoad = prevLength === 0 && newLength > 0;

    const wasNewMessageAppended =
      newLength > prevLength && newLastMessageId !== prevLastMessageId;

    if (isInitialLoad || wasNewMessageAppended) {
      scrollToBottom(isInitialLoad ? 'auto' : 'smooth');
    }

    prevMessagesLengthRef.current = newLength;
    prevLastMessageIdRef.current = newLastMessageId;
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

  if (chatLoading && !isFetchingNextPage) {
    return <ChatSkeleton />;
  }

  return (
    <div
      id='main-scroll-container'
      className='flex-1 flex flex-col-reverse p-4 overflow-y-auto hide-scrollbar'
    >
      {messages.length === 0 ? (
        <EmptyMessageState />
      ) : (
        <InfiniteScroll
          dataLength={messages.length}
          next={fetchNextPage}
          inverse={true}
          hasMore={hasNextPage ?? false}
          className='flex flex-col-reverse'
          scrollableTarget='main-scroll-container'
          loader={
            <div className='text-center p-4'>
              <Icons.loading className='size-11' />
            </div>
          }
        >
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
        </InfiniteScroll>
      )}
    </div>
  );
};

export default ChatMessages;
