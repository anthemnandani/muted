'use client';

import { RECEIVE_MSG_EVENT } from '@/lib/socket-events';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { MessageRequestStatus, MessageStatus } from '@prisma/client';
import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { toast } from 'sonner';
import { useSocket } from './SocketContext';

interface User {
  id: string;
  username: string;
  fullName?: string | null;
  image?: string | null;
}

interface Message {
  id: string;
  content: string;
  type: 'TEXT' | 'MEDIA';
  status?: MessageStatus;
  createdAt: string | Date;
  readAt?: Date | null;
  senderId: string;
  chatId: string;
  sender: User;
}

interface Chat {
  id: string;
  participants: User[];
  lastMessage?: Message;
  lastMessageAt?: Date | null;
  unreadCount: number;
  messageRequest?: boolean;
  messageRequestStatus?: MessageRequestStatus | null;
  requestedById?: string | null;
}

interface ChatContextType {
  currentChat: Chat | null;
  messages: Message[];
  chats: Chat[];
  messageRequests: Chat[];
  messageRequestsCount: number;
  chatLoading: boolean;
  chatsLoading: boolean;
  messagesLoaded: boolean;
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

  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messageRequests, setMessageRequests] = useState<Chat[]>([]);
  const [messageRequestsCount, setMessageRequestsCount] = useState(0);
  const [messagesLoaded, setMessagesLoaded] = useState(false);

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
      setMessagesLoaded(true);

      if (currentChat?.id && currentChat.unreadCount > 0) {
        resetChatUnreadCount(currentChat.id);
      }
    }
  }, [messagesData?.messages, currentChat?.id]);

  const getOrCreateChatMutation = api.chat.getOrCreateChat.useMutation({
    onSuccess: (data: any) => {
      const { chat } = data;

      handleSetCurrChat(chat);

      const existingChatIndex = chats.findIndex((c) => c.id === chat.id);
      if (existingChatIndex === -1) {
        const newChats = [chat, ...chats];
        setChats(newChats);
      } else {
        setChats((prev) => prev.map((c) => (c.id === chat.id ? chat : c)));
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
      setChats((prev) => prev.filter((chat) => chat.id !== variables.chatId));
      setMessageRequests((prev) =>
        prev.filter((chat) => chat.id !== variables.chatId)
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
      console.error('Error restoring chat:', error);
      toast.error('Failed to restore chat');
    },
  });

  const updateMessage = (tempId: string, newMessage: Message) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === tempId ? newMessage : msg))
    );

    if (newMessage.status === MessageStatus.SENT) {
      updateChatLastMessage(newMessage.chatId, newMessage);
    }
  };

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
    updateChatLastMessage(message.chatId, message);
  };

  const closeChat = () => {
    setCurrentChat(null);
    setMessages([]);
    setMessagesLoaded(false);
  };

  const resetChatUnreadCount = (chatId: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      )
    );
  };

  const updateCurrentChat = (chatData: Chat) => {
    setCurrentChat(chatData);
  };

  const updateChatLastMessage = (chatId: string, message: Message) => {
    const updatedChats = chats.map((chat) => {
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

    if (currentChat?.id === chatId) {
      setCurrentChat((prev) =>
        prev
          ? {
              ...prev,
              lastMessage: message,
              lastMessageAt: new Date(message.createdAt),
            }
          : null
      );
    }
  };

  const handleSetCurrChat = (chatData: Chat) => {
    setCurrentChat(chatData);
    setMessagesLoaded(false);
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

  const updateSeen = (updatedMessage: Message) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
      )
    );
  };

  useEffect(() => {
    if (chatsData) {
      setChats(chatsData.chats || []);
      setMessageRequests(chatsData.messageRequests || []);
      setMessageRequestsCount(chatsData.messageRequestsCount || 0);
    }
  }, [chatsData]);

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
      if (currentChat?.id === chatId) {
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
  }, [
    socket,
    currentChat?.id,
    addMessage,
    updateSeen,
    refreshChats,
    updateCurrentChat,
  ]);

  const contextValue: ChatContextType = {
    currentChat,
    messages,
    chatLoading: chatLoading || isFetching,
    chatsLoading,
    chats,
    messageRequests,
    messageRequestsCount,
    messagesLoaded,
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

const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export { ChatProvider, useChat };
export type { Chat, ChatContextType, Message, User };
