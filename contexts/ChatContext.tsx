'use client';

import { RECEIVE_MSG_EVENT } from '@/lib/socket-events';
import { Chat, Message } from '@/lib/types';
import useChatStore from '@/store/chatStore';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { MessageStatus } from '@prisma/client';
import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import { toast } from 'sonner';
import { useSocket } from './SocketContext';

interface ChatContextType {
  chatLoading: boolean;
  chatsLoading: boolean;
  handleSetCurrChat: (chat: Chat) => void;
  updateCurrentChat: (chat: Chat) => void;
  refreshChats: () => Promise<void>;
  addMessage: (message: Message) => void;
  updateSeen: (message: Message) => void;
  updateMessage: (tempId: string, newMessage: Message) => void;
  closeChat: () => void;
  setChats: (chats: Chat[]) => void;
  getOrCreateChat: (otherUserId: string) => Promise<void>;
  deleteMessages: (chatId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  restoreChat: (chatId: string) => Promise<void>;
  getOrCreateChatLoading: boolean;
  deleteMessagesLoading: boolean;
  deleteChatLoading: boolean;
  restoreChatLoading: boolean;
  resetChatUnreadCount: (chatId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const ChatProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useUser();
  const trpcUtils = api.useUtils();

  const {
    currentChat,
    setCurrentChat,
    setMessages,
    chats,
    setChats,
    setMessageRequests,
    setMessageRequestsCount,
  } = useChatStore();

  const {
    data: chatsData,
    isLoading: chatsLoading,
    refetch: refetchChats,
  } = api.chat.getChats.useQuery(undefined, {
    enabled: !!user?.id,
  });

  const {
    data: messagesData,
    isLoading: chatLoading,
    isFetching,
  } = api.chat.getMessages.useQuery(
    { chatId: currentChat?.id ?? '' },
    {
      enabled: !!currentChat?.id,
      refetchOnWindowFocus: false,
      staleTime: 0,
      cacheTime: 0,
    }
  );

  useEffect(() => {
    if (messagesData?.messages) {
      setMessages(messagesData.messages);

      if (currentChat?.id && currentChat.unreadCount > 0) {
        resetChatUnreadCount(currentChat.id);
      }
    }
  }, [messagesData?.messages, currentChat?.id, setMessages]);

  const getOrCreateChatMutation = api.chat.getOrCreateChat.useMutation({
    onSuccess: (data: any) => {
      const { chat } = data;

      handleSetCurrChat(chat);

      const existingChatIndex = chats.findIndex((c) => c.id === chat.id);
      if (existingChatIndex === -1) {
        const newChats = [chat, ...chats];
        setChats(newChats);
      } else {
        setChats(chats.map((c) => (c.id === chat.id ? chat : c)));
      }
    },
    onError: (error: any) => {
      toast.error('Failed to start chat');
    },
    onSettled: async () => {
      await trpcUtils.chat.getChats.invalidate();
    },
  });

  const deleteMessagesMutation = api.chat.deleteMessages.useMutation({
    onSuccess: () => {
      if (currentChat) {
        toast.success('Messages cleared');
      }
    },
    onSettled: async () => {
      await trpcUtils.chat.getChats.invalidate();
    },
    onError: (error: any) => {
      toast.error('Failed to clear messages');
    },
  });

  const deleteChatMutation = api.chat.deleteChat.useMutation({
    onSuccess: (_, variables) => {
      setChats(
        useChatStore
          .getState()
          .chats.filter((chat) => chat.id !== variables.chatId)
      );
      setMessageRequests(
        useChatStore
          .getState()
          .messageRequests.filter((chat) => chat.id !== variables.chatId)
      );

      if (currentChat?.id === variables.chatId) {
        setCurrentChat(null);
      }

      toast.success('Chat deleted');
    },
    onError: (error: any) => {
      toast.error('Failed to delete chat');
    },
  });

  const restoreChatMutation = api.chat.restoreChat.useMutation({
    onSuccess: () => {
      refreshChats();
      toast.success('Chat restored');
    },
    onError: (error: any) => {
      toast.error('Failed to restore chat');
    },
  });

  const updateMessage = useCallback(
    (tempId: string, newMessage: Message) => {
      setMessages(
        useChatStore
          .getState()
          .messages.map((msg) => (msg.id === tempId ? newMessage : msg))
      );

      if (newMessage.status === MessageStatus.SENT) {
        updateChatLastMessage(newMessage.chatId, newMessage);
      }
    },
    [setMessages]
  );

  const addMessage = useCallback(
    (message: Message) => {
      setMessages([...useChatStore.getState().messages, message]);
      updateChatLastMessage(message.chatId, message);
    },
    [setMessages]
  );

  const closeChat = () => {
    setCurrentChat(null);
    setMessages([]);
  };

  const resetChatUnreadCount = (chatId: string) => {
    const currentChats = useChatStore.getState().chats;
    setChats(
      currentChats.map((chat) =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      )
    );
  };

  const updateCurrentChat = (chatData: Chat) => {
    setCurrentChat(chatData);
  };

  const updateChatLastMessage = (chatId: string, message: Message) => {
    const currentChats = useChatStore.getState().chats;
    const currentChatData = useChatStore.getState().currentChat;

    const updatedChats = currentChats.map((chat) => {
      if (chat.id === chatId) {
        return {
          ...chat,
          lastMessage: message,
          lastMessageAt: new Date(message.createdAt),
        };
      }
      return chat;
    });

    const sortedChats = [...updatedChats].sort((a, b) => {
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bTime - aTime;
    });

    setChats(sortedChats);

    if (currentChatData?.id === chatId) {
      setCurrentChat(
        currentChatData
          ? {
              ...currentChatData,
              lastMessage: message,
              lastMessageAt: new Date(message.createdAt),
            }
          : null
      );
    }
  };

  const handleSetCurrChat = (chatData: Chat) => {
    setCurrentChat(chatData);
    if (socket) {
      socket.emit('JOIN', { chatId: chatData.id });
    }
  };

  const getOrCreateChat = async (otherUserId: string) => {
    try {
      await getOrCreateChatMutation.mutateAsync({ otherUserId });
    } catch (error) {
      console.error('Error getting/creating chat:', error);
    }
  };

  const deleteMessages = async (chatId: string) => {
    try {
      await deleteMessagesMutation.mutateAsync({ chatId });
    } catch (error) {
      console.error('Error deleting messages:', error);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      await deleteChatMutation.mutateAsync({ chatId });
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const restoreChat = async (chatId: string) => {
    try {
      await restoreChatMutation.mutateAsync({ chatId });
    } catch (error) {
      console.error('Error restoring chat:', error);
    }
  };

  const refreshChats = useCallback(async () => {
    try {
      await refetchChats();
    } catch (error) {
      console.error('Error refreshing chats:', error);
    }
  }, [refetchChats]);

  const updateSeen = useCallback(
    (updatedMessage: Message) => {
      const currentMessages = useChatStore.getState().messages;
      setMessages(
        currentMessages.map((msg) =>
          msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
        )
      );
    },
    [setMessages]
  );

  useEffect(() => {
    if (chatsData) {
      setChats(chatsData.chats || []);
      setMessageRequests(chatsData.messageRequests || []);
      setMessageRequestsCount(chatsData.messageRequestsCount || 0);
    }
  }, [chatsData, setChats, setMessageRequests, setMessageRequestsCount]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg: Message) => {
      const currentChatData = useChatStore.getState().currentChat;
      if (msg.chatId === currentChatData?.id) {
        addMessage(msg);
      }
    };

    const handleSeenMessageUpdate = ({
      updatedMsg,
    }: {
      updatedMsg: Message;
    }) => {
      const currentChatData = useChatStore.getState().currentChat;
      if (updatedMsg && currentChatData?.id === updatedMsg.chatId) {
        updateSeen(updatedMsg);
      }
    };

    const handleChatListUpdate = () => {
      refreshChats();
    };

    const handleMessageRequestReceived = () => {
      refreshChats();
    };

    const handleMessageRequestAccepted = ({
      chatId,
      acceptedChat,
    }: {
      chatId: string;
      acceptedChat: Chat;
    }) => {
      const currentChatData = useChatStore.getState().currentChat;
      if (currentChatData?.id === chatId) {
        updateCurrentChat(acceptedChat);
      }
      refreshChats();
    };

    socket.on(RECEIVE_MSG_EVENT, handleReceiveMessage);
    socket.on('SEEN_MESSAGE_UPDATE', handleSeenMessageUpdate);
    socket.on('CHAT_LIST_UPDATE', handleChatListUpdate);
    socket.on('MESSAGE_REQUEST_RECEIVED', handleMessageRequestReceived);
    socket.on('MESSAGE_REQUEST_ACCEPTED', handleMessageRequestAccepted);

    return () => {
      socket.off(RECEIVE_MSG_EVENT, handleReceiveMessage);
      socket.off('SEEN_MESSAGE_UPDATE', handleSeenMessageUpdate);
      socket.off('CHAT_LIST_UPDATE', handleChatListUpdate);
      socket.off('MESSAGE_REQUEST_RECEIVED', handleMessageRequestReceived);
      socket.off('MESSAGE_REQUEST_ACCEPTED', handleMessageRequestAccepted);
    };
  }, [socket, addMessage, updateSeen, refreshChats, updateCurrentChat]);

  const contextValue: ChatContextType = {
    chatLoading: chatLoading || isFetching,
    chatsLoading,
    handleSetCurrChat,
    updateCurrentChat,
    refreshChats,
    addMessage,
    updateSeen,
    updateMessage,
    closeChat,
    setChats,
    getOrCreateChat,
    deleteMessages,
    deleteChat,
    restoreChat,
    resetChatUnreadCount,
    getOrCreateChatLoading: getOrCreateChatMutation.isLoading,
    deleteMessagesLoading: deleteMessagesMutation.isLoading,
    deleteChatLoading: deleteChatMutation.isLoading,
    restoreChatLoading: restoreChatMutation.isLoading,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
};

const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export { ChatProvider, useChatContext };
