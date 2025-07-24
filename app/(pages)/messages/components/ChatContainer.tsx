'use client';

import { useSocket } from '@/contexts/SocketContext';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import MessageInput from './MessageInput';

import useChat from '@/hooks/useChat';
import { TYPING_EVENT } from '@/lib/socket-events';
import useChatStore from '@/store/chatStore';
import EmptyMessageState from './EmptyMessageState';
import MessageRequestActions from './MessageRequestActions';
import MessageRequestAlert from './MessageRequestAlert';

const TYPING_TIMER_LENGTH = 800;
let typingTimer: NodeJS.Timeout;

const ChatContainer = () => {
  const [isMultiLine, setIsMultiLine] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const { currentChat } = useChatStore();
  const { socket, isConnected } = useSocket();
  const { user } = useUser();

  const {
    isMessageRequest,
    setMessage,
    resetUnreadCountRealTime,
    showRequestLimitAlert,
    setShowRequestLimitAlert,
    isReceiver,
    showMessageInput,
    loading,
    sendMessage,
    message,
  } = useChat();

  const handleChange = (
    text: string,
    element: EventTarget & HTMLDivElement
  ) => {
    setMessage(text);

    if (!socket || !currentChat?.id) return;

    if (isMessageRequest) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit(TYPING_EVENT, { chatId: currentChat.id, isTyping: true });
    }

    const lineHeight = parseInt(window.getComputedStyle(element).lineHeight);
    const height = element.scrollHeight;
    const lines = Math.round(height / lineHeight);
    setIsMultiLine(lines > 1);

    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      setIsTyping(false);
      socket.emit(TYPING_EVENT, { chatId: currentChat.id, isTyping: false });
    }, TYPING_TIMER_LENGTH);
  };

  useEffect(() => {
    if (currentChat?.id && currentChat.unreadCount > 0) {
      resetUnreadCountRealTime();
    }
  }, [currentChat?.id]);

  if (!currentChat) {
    return <EmptyMessageState />;
  }

  const otherUser = currentChat.participants.find((p) => p.id !== user?.id);

  return (
    <div className='w-full h-full flex flex-col relative'>
      <ChatHeader selectedChat={currentChat} />
      {showRequestLimitAlert && (
        <MessageRequestAlert
          setShowRequestLimitAlert={setShowRequestLimitAlert}
        />
      )}

      <ChatMessages />

      {isMessageRequest && isReceiver && (
        <MessageRequestActions
          senderName={otherUser?.fullName || otherUser?.username || 'Unknown'}
        />
      )}

      {showMessageInput && (
        <MessageInput
          value={message}
          isMultiLine={isMultiLine}
          setIsMultiLine={setIsMultiLine}
          onChange={handleChange}
          onSubmit={sendMessage}
          loading={loading}
          placeholder='Type a message...'
          disabled={!isConnected}
        />
      )}
    </div>
  );
};

export default ChatContainer;
