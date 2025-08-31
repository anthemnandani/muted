'use client';

import { RECEIVE_MSG_EVENT } from '@/lib/socket-events';
import { Chat, ChatUser, Message, MessageReaction } from '@/lib/types';
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
  fetchNextPage: () => void;
  hasNextPage: boolean | undefined;
  chatsLoading: boolean;
  isFetchingNextPage: boolean;
  handleSetCurrChat: (chat: Chat) => void;
  updateCurrentChat: (chat: Chat) => void;
  refreshChats: () => Promise<void>;
  addMessage: (message: Message) => void;
  updateMessage: (tempId: string, newMessage: Message) => void;
  closeChat: () => void;
  setChats: (chats: Chat[]) => void;
  getOrCreateChat: (otherUserId: string) => Promise<void>;
  deleteMessages: (chatId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  getOrCreateChatLoading: boolean;
  deleteMessagesLoading: boolean;
  deleteChatLoading: boolean;
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
    retry: false,
    refetchOnWindowFocus: false,
  });

  const {
    data: messagesData,
    isLoading: chatLoading,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = api.chat.getMessages.useInfiniteQuery(
    { chatId: currentChat?.id ?? '', limit: 60 },
    {
      enabled: !!currentChat?.id,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
      staleTime: 0,
      cacheTime: 0,
    }
  );

  const resetUnreadCountMutation = api.chat.resetUnreadCount.useMutation({
    onSuccess: () => {
      refreshChats();
    },
    onError: (error: any) => {
      console.error('Failed to reset unread count:', error);
    },
  });

  useEffect(() => {
    if (!messagesData) return;
    const fetchedMessages = messagesData?.pages
      .slice()
      .reverse()
      .flatMap((page) => page.messages);
    const currentMessages = useChatStore.getState().messages;

    const fetchedMessageIds = new Set(fetchedMessages.map((msg) => msg.id));

    const realTimeMessages = currentMessages.filter(
      (msg) => !fetchedMessageIds.has(msg.id)
    );

    setMessages([...fetchedMessages, ...realTimeMessages]);

    if (
      messagesData?.pages.length === 1 &&
      currentChat?.id &&
      currentChat.unreadCount > 0
    ) {
      resetChatUnreadCount(currentChat.id);
    }
  }, [messagesData, currentChat?.id]);

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
    resetUnreadCountMutation.mutate({ chatId });
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

  const refreshChats = useCallback(async () => {
    try {
      await refetchChats();
    } catch (error) {
      console.error('Error refreshing chats:', error);
    }
  }, [refetchChats]);

  useEffect(() => {
    if (chatsData) {
      // Todo: Improve this code
      const transformChat = (chat: any) => ({
        ...chat,
        participants: chat.participants as ChatUser[],
      });

      const transformedChats = chatsData.chats.map(transformChat);
      const transformedMessageRequests =
        chatsData.messageRequests.map(transformChat);

      setChats(transformedChats);
      setMessageRequests(transformedMessageRequests);
      setMessageRequestsCount(chatsData.messageRequestsCount || 0);
    }
  }, [chatsData, setChats, setMessageRequests, setMessageRequestsCount]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg: Message) => {
      const currentChatData = useChatStore.getState().currentChat;
      if (msg.chatId === currentChatData?.id) {
        addMessage(msg);
        resetChatUnreadCount(msg.chatId);
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

    const handleReactionUpdated = (data: {
      messageId: string;
      userId: string;
      emoji: string;
      action: 'added' | 'updated' | 'removed';
      reaction: MessageReaction | null;
    }) => {
      const currentMessages = useChatStore.getState().messages;

      const updatedMessages = currentMessages.map((msg) => {
        if (msg.id === data.messageId) {
          let updatedReactions = [...(msg.reactions || [])];

          if (data.action === 'removed') {
            updatedReactions = updatedReactions.filter(
              (r) => r.userId !== data.userId
            );
          } else if (data.reaction) {
            const existingIndex = updatedReactions.findIndex(
              (r) => r.userId === data.userId
            );
            if (existingIndex > -1) {
              updatedReactions[existingIndex] = data.reaction;
            } else {
              updatedReactions.push(data.reaction);
            }
          }

          return { ...msg, reactions: updatedReactions };
        }
        return msg;
      });

      setMessages(updatedMessages);
    };

    socket.on(RECEIVE_MSG_EVENT, handleReceiveMessage);
    socket.on('CHAT_LIST_UPDATE', handleChatListUpdate);
    socket.on('MESSAGE_REQUEST_RECEIVED', handleMessageRequestReceived);
    socket.on('MESSAGE_REQUEST_ACCEPTED', handleMessageRequestAccepted);
    socket.on('REACTION_UPDATED', handleReactionUpdated);

    return () => {
      socket.off(RECEIVE_MSG_EVENT, handleReceiveMessage);
      socket.off('CHAT_LIST_UPDATE', handleChatListUpdate);
      socket.off('MESSAGE_REQUEST_RECEIVED', handleMessageRequestReceived);
      socket.off('MESSAGE_REQUEST_ACCEPTED', handleMessageRequestAccepted);
      socket.off('REACTION_UPDATED', handleReactionUpdated);
    };
  }, [socket, addMessage, refreshChats, updateCurrentChat]);

  const contextValue: ChatContextType = {
    chatLoading: chatLoading || isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    chatsLoading,
    handleSetCurrChat,
    updateCurrentChat,
    refreshChats,
    addMessage,
    updateMessage,
    closeChat,
    setChats,
    getOrCreateChat,
    deleteMessages,
    deleteChat,
    resetChatUnreadCount,
    getOrCreateChatLoading: getOrCreateChatMutation.isLoading,
    deleteMessagesLoading: deleteMessagesMutation.isLoading,
    deleteChatLoading: deleteChatMutation.isLoading,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
};

const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export { ChatProvider, useChatContext };
