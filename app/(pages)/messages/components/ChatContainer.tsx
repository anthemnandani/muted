'use client';

import type { Message } from '@/contexts/ChatContext';
import { useChat } from '@/contexts/ChatContext';
import { useSocket } from '@/contexts/SocketContext';
import { useUser } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import MessageInput from './MessageInput';

import { RECEIVE_MSG_EVENT, TYPING_EVENT } from '@/lib/socket-events';
import { MessageStatus } from '@prisma/client';
import EmptyMessageState from './EmptyMessageState';

const TYPING_TIMER_LENGTH = 800;
let typingTimer: NodeJS.Timeout;

const ChatContainer = () => {
  const [message, setMessage] = useState('');
  const [isMultiLine, setIsMultiLine] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const {
    currentChat,
    messages,
    updateSeen,
    addMessage,
    updateMessage,
    chatLoading,
    messagesLoaded,
    refreshChats,
  } = useChat();
  const { socket } = useSocket();
  const { user } = useUser();

  const sendMessage = async () => {
    if (!message.trim() || !currentChat?.id || !socket) return;

    socket.emit(TYPING_EVENT, { chatId: currentChat.id, isTyping: false });

    setLoading(true);
    const tempMessage = message;
    setMessage('');

    const optimisticMessage: Message = {
      id: uuidv4(),
      content: tempMessage,
      type: 'TEXT',
      status: MessageStatus.SENDING,
      createdAt: new Date().toISOString(),
      senderId: user!.id,
      chatId: currentChat.id,
      sender: {
        id: user!.id,
        username: user!.username || '',
        fullName: user!.fullName,
        image: user!.imageUrl,
      },
    };

    addMessage(optimisticMessage);

    try {
      const sentMsg: Message = await new Promise((resolve, reject) => {
        socket.timeout(30000).emit(
          'SEND_MESSAGE',
          {
            chatId: currentChat.id,
            content: tempMessage,
            type: 'TEXT',
          },
          (err: any, sentMsg: Message) => {
            if (err) reject(err);
            else resolve(sentMsg);
          }
        );
      });

      updateMessage(optimisticMessage.id, sentMsg);

      refreshChats();

      const otherUser = currentChat.participants.find((p) => p.id !== user?.id);
      if (otherUser) {
        socket.emit('chat-list-update', { userId: otherUser.id });
      }
    } catch (error) {
      const failedMessage: Message = {
        ...optimisticMessage,
        status: MessageStatus.FAILED,
      };
      updateMessage(optimisticMessage.id, failedMessage);
      setMessage(tempMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.FormEvent<HTMLDivElement>) => {
    setMessage(e.currentTarget.innerText);

    if (!socket || !currentChat?.id) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit(TYPING_EVENT, { chatId: currentChat.id, isTyping: true });
    }

    const element = e.currentTarget;
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

  const memoizedMessages = useMemo(() => {
    return messages;
  }, [messages]);

  useEffect(() => {
    if (!messagesLoaded || !currentChat?.id || !user?.id) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const messageId = entry.target.getAttribute('data-message-id');
            const isSender =
              entry.target.getAttribute('data-is-sender') === 'true';

            if (!isSender && messageId && socket && currentChat?.id) {
              const messageToUpdate = messages.find(
                (msg) => msg.id === messageId
              );

              if (
                messageToUpdate &&
                messageToUpdate.status !== MessageStatus.SEEN
              ) {
                socket.emit('SEEN_MESSAGE', {
                  messageId,
                  chatId: currentChat.id,
                });

                const updatedMessage = {
                  ...messageToUpdate,
                  status: MessageStatus.SEEN,
                  readAt: new Date(),
                };

                updateSeen(updatedMessage);
              }
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    memoizedMessages.forEach((msg) => {
      if (msg.senderId !== user?.id && msg.status !== MessageStatus.SEEN) {
        const messageElement = document.querySelector(
          `[data-message-id="${msg.id}"]`
        );
        if (messageElement) {
          messageElement.setAttribute('data-is-sender', 'false');
          observer.observe(messageElement);
        }
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [
    memoizedMessages,
    socket,
    currentChat?.id,
    user?.id,
    updateSeen,
    messagesLoaded,
  ]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg: Message) => {
      if (msg.chatId === currentChat?.id) {
        addMessage(msg);
      }
    };

    const handleSeenMessageUpdate = ({
      updatedMsg,
    }: {
      updatedMsg: Message;
    }) => {
      if (updatedMsg && currentChat?.id) {
        updateSeen(updatedMsg);
      }
    };

    socket.on(RECEIVE_MSG_EVENT, handleReceiveMessage);
    socket.on('SEEN_MESSAGE_UPDATE', handleSeenMessageUpdate);

    return () => {
      socket.off(RECEIVE_MSG_EVENT, handleReceiveMessage);
      socket.off('SEEN_MESSAGE_UPDATE', handleSeenMessageUpdate);
    };
  }, [socket, currentChat?.id, addMessage, updateSeen]);

  if (!currentChat) {
    return <EmptyMessageState />;
  }

  return (
    <div className='w-full h-full flex flex-col'>
      <ChatHeader selectedChat={currentChat} />
      <ChatMessages messages={memoizedMessages} chatLoading={chatLoading} />
      <MessageInput
        value={message}
        isMultiLine={isMultiLine}
        setIsMultiLine={setIsMultiLine}
        onChange={handleChange}
        onSubmit={sendMessage}
        loading={loading}
        placeholder='Type a message...'
      />
    </div>
  );
};

export default ChatContainer;
