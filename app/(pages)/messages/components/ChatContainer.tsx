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

import { TYPING_EVENT } from '@/lib/socket-events';
import type { ViewMode } from '@/lib/types';
import { api } from '@/trpc/react';
import { MessageStatus } from '@prisma/client';
import { toast } from 'sonner';
import EmptyMessageState from './EmptyMessageState';
import MessageRequestActions from './MessageRequestActions';
import MessageRequestAlert from './MessageRequestAlert';

const TYPING_TIMER_LENGTH = 800;
let typingTimer: NodeJS.Timeout;

const ChatContainer = ({
  setViewMode,
}: {
  setViewMode: (mode: ViewMode) => void;
}) => {
  const [message, setMessage] = useState('');
  const [isMultiLine, setIsMultiLine] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showRequestLimitAlert, setShowRequestLimitAlert] = useState(false);

  const {
    currentChat,
    messages,
    updateSeen,
    addMessage,
    updateMessage,
    chatLoading,
    refreshChats,
    resetChatUnreadCount,
    updateCurrentChat,
    closeChat,
  } = useChat();
  const { socket, isConnected } = useSocket();
  const { user } = useUser();

  const acceptMessageRequestMutation =
    api.chat.acceptMessageRequest.useMutation({
      onSuccess: (data) => {
        const acceptedChat = data.chat;
        resetChatUnreadCount(acceptedChat.id);

        if (currentChat?.id === acceptedChat.id) {
          updateCurrentChat(acceptedChat);
        }

        if (socket && acceptedChat.requestedById) {
          socket.emit('MESSAGE_REQUEST_ACCEPTED', {
            senderId: acceptedChat.requestedById,
            chatId: acceptedChat.id,
            acceptedChat: acceptedChat,
          });
        }

        refreshChats();
        setViewMode('chats');
        toast.success('Message request accepted');
      },
      onError: () => {
        toast.error('Failed to accept message request');
      },
    });

  const declineMessageRequestMutation =
    api.chat.declineMessageRequest.useMutation({
      onSuccess: () => {
        if (currentChat?.id) {
          closeChat();
        }

        refreshChats();
        setViewMode('chats');
      },
      onError: () => {
        toast.error('Failed to decline message request');
      },
    });

  const isMessageRequest =
    currentChat?.messageRequest &&
    currentChat?.messageRequestStatus === 'PENDING';

  const isReceiver = currentChat?.requestedById !== user?.id;
  const isSender = currentChat?.requestedById === user?.id;

  const showMessageInput = !isMessageRequest || (isMessageRequest && isSender);

  const userMessageCount = useMemo(() => {
    if (!isMessageRequest || !isSender) return 0;
    return messages.filter((msg) => msg.senderId === user?.id).length;
  }, [messages, isMessageRequest, isSender, user?.id]);

  const markAllMessagesAsSeen = () => {
    if (!socket || !currentChat?.id || !user?.id) return;

    const hasUnreadMessages = messages.some(
      (msg) => msg.senderId !== user.id && msg.status !== MessageStatus.SEEN
    );

    if (!hasUnreadMessages) return;

    socket.emit('MARK_ALL_MESSAGES_SEEN', {
      chatId: currentChat.id,
    });

    messages.forEach((msg) => {
      if (msg.senderId !== user.id && msg.status !== MessageStatus.SEEN) {
        const updatedMessage = {
          ...msg,
          status: MessageStatus.SEEN,
          readAt: new Date(),
        };
        updateSeen(updatedMessage);
      }
    });
  };

  const sendMessage = async () => {
    if (!message.trim() || !currentChat?.id || !socket || !isConnected) return;

    const tempMessage = message;
    setMessage('');

    const optimisticMessage: Message = {
      id: uuidv4(),
      content: tempMessage,
      type: 'TEXT',
      status:
        userMessageCount >= 1 ? MessageStatus.FAILED : MessageStatus.SENDING,
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

    if (isMessageRequest && isSender && userMessageCount >= 1) {
      setShowRequestLimitAlert(true);
      return;
    }

    setLoading(true);

    socket.emit(TYPING_EVENT, { chatId: currentChat.id, isTyping: false });

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
            if (err) {
              if (err.type === 'MESSAGE_LIMIT') {
                setShowRequestLimitAlert(true);
              }
              reject(err);
            } else {
              resolve(sentMsg);
            }
          }
        );
      });

      updateMessage(optimisticMessage.id, sentMsg);
    } catch (error: any) {
      updateMessage(optimisticMessage.id, {
        ...optimisticMessage,
        status: MessageStatus.FAILED,
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleAcceptRequest = async () => {
    if (!currentChat?.id) return;

    await acceptMessageRequestMutation.mutateAsync({ chatId: currentChat.id });
  };

  const handleDeclineRequest = async () => {
    if (!currentChat?.id) return;
    await declineMessageRequestMutation.mutateAsync({ chatId: currentChat.id });
  };

  useEffect(() => {
    if (messages.length > 0 && currentChat?.id && !isMessageRequest) {
      markAllMessagesAsSeen();
    }
  }, [messages.length]);

  if (!currentChat) {
    return <EmptyMessageState />;
  }

  const otherUser = currentChat.participants.find((p) => p.id !== user?.id);

  return (
    <div className='w-full h-full flex flex-col'>
      <ChatHeader selectedChat={currentChat} />
      {showRequestLimitAlert && (
        <MessageRequestAlert
          setShowRequestLimitAlert={setShowRequestLimitAlert}
        />
      )}

      <ChatMessages messages={messages} chatLoading={chatLoading} />

      {isMessageRequest && isReceiver && (
        <MessageRequestActions
          senderName={otherUser?.fullName || otherUser?.username || 'Unknown'}
          onAccept={handleAcceptRequest}
          onDecline={handleDeclineRequest}
          isAccepting={acceptMessageRequestMutation.isLoading}
          isDeclining={declineMessageRequestMutation.isLoading}
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
