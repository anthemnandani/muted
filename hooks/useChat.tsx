import { useChatContext } from '@/contexts/ChatContext';
import { useSocket } from '@/contexts/SocketContext';
import { TYPING_EVENT } from '@/lib/socket-events';
import { Message } from '@/lib/types';
import useChatStore from '@/store/chatStore';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { MessageRequestStatus, MessageStatus } from '@prisma/client';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

const useChat = () => {
  const { currentChat, messages, setViewMode } = useChatStore();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRequestLimitAlert, setShowRequestLimitAlert] = useState(false);

  const {
    resetChatUnreadCount,
    updateCurrentChat,
    refreshChats,
    closeChat,
    updateMessage,
    addMessage,
  } = useChatContext();
  const { user } = useUser();

  const { socket, isConnected } = useSocket();

  const isMessageRequest =
    currentChat?.messageRequest &&
    (currentChat?.messageRequestStatus === MessageRequestStatus.PENDING ||
      currentChat?.messageRequestStatus === MessageRequestStatus.DECLINED);

  const isReceiver = currentChat?.requestedById !== user?.id;
  const isSender = currentChat?.requestedById === user?.id;

  const userMessageCount = useMemo(() => {
    if (!isMessageRequest || !isSender) return 0;
    return messages.filter((msg) => msg.senderId === user?.id).length;
  }, [messages, isMessageRequest, isSender, user?.id]);

  const showMessageInput = !isMessageRequest || (isMessageRequest && isSender);

  const { mutateAsync: acceptMessageRequest, isLoading: isAcceptingRequest } =
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

  const { mutateAsync: declineMessageRequest, isLoading: isDecliningRequest } =
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

  const handleAcceptRequest = async () => {
    if (!currentChat?.id) return;

    await acceptMessageRequest({ chatId: currentChat.id });
  };

  const handleDeclineRequest = async () => {
    if (!currentChat?.id) return;
    await declineMessageRequest({ chatId: currentChat.id });
  };

  const resetUnreadCountRealTime = () => {
    if (!currentChat?.id || !socket) return;

    resetChatUnreadCount(currentChat.id);
  };

  return {
    handleAcceptRequest,
    handleDeclineRequest,
    sendMessage,
    resetUnreadCountRealTime,
    setMessage,
    setShowRequestLimitAlert,
    isMessageRequest,
    showMessageInput,
    isSender,
    isReceiver,
    message,
    showRequestLimitAlert,
    loading,
    isAcceptingRequest,
    isDecliningRequest,
  };
};

export default useChat;
