import { useChatContext } from '@/contexts/ChatContext';
import { useSocket } from '@/contexts/SocketContext';
import { MessageRequestStatus, MessageStatus } from '@/generated/prisma/enums';
import { TYPING_EVENT } from '@/lib/socket-events';
import { ChatUser, Message } from '@/lib/types';
import useChatStore from '@/store/chatStore';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

const MESSAGE_TIMEOUT = 30000;

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
        const transformedChat = {
          ...acceptedChat,
          participants: acceptedChat.participants as ChatUser[],
        };
        resetChatUnreadCount(acceptedChat.id);

        if (currentChat?.id === acceptedChat.id) {
          updateCurrentChat(transformedChat);
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
      const sentMsg: Message = await Promise.race([
        new Promise<Message>((resolve, reject) => {
          socket.emit(
            'SEND_MESSAGE',
            {
              chatId: currentChat.id,
              content: tempMessage,
              type: 'TEXT',
            },
            (response: any) => {
              if (response.error) {
                if (response.type === 'MESSAGE_LIMIT') {
                  setShowRequestLimitAlert(true);
                }
                reject(response);
              } else {
                resolve(response);
              }
            },
          );
        }),
        new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(
              new Error(
                'Message send timeout - request took longer than 30 seconds',
              ),
            );
          }, MESSAGE_TIMEOUT);
        }),
      ]);

      updateMessage(optimisticMessage.id, sentMsg);
    } catch (error: any) {
      if (error.message?.includes('timeout')) {
        toast.error('Message send timed out. Please try again.');
      }

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
