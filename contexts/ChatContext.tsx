'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  ReactNode,
  FC,
} from 'react';
import { useSocket } from './SocketContext';
import { useUser } from '@clerk/nextjs';
import { api } from '@/trpc/react';
import { MessageStatus } from '@prisma/client';

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
}

interface ChatState {
  currentChat: Chat | null;
  messages: Message[];
  chats: Chat[];
  chatLoading: boolean;
  chatsLoading: boolean;
  messagesLoaded: boolean;
}

interface ChatContextType extends ChatState {
  handleSetCurrChat: (chat: Chat) => Promise<void>;
  refreshChats: () => Promise<void>;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateSeen: (message: Message) => void;
  updateMessage: (tempId: string, newMessage: Message) => void;
  closeChat: () => void;
  setChats: (chats: Chat[]) => void;
  getOrCreateChat: (otherUserId: string) => Promise<void>;
  deleteMessages: (chatId: string) => Promise<void>;
  getOrCreateChatLoading: boolean;
  deleteMessagesLoading: boolean;
  resetChatUnreadCount: (chatId: string) => void;
}

type ChatAction =
  | { type: 'SET_CURRENT_CHAT'; payload: Chat | null }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'SET_CHATS'; payload: Chat[] }
  | { type: 'UPDATE_SEEN'; payload: Message }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { tempId: string; newMessage: Message } }
  | { type: 'RESET_CHAT_UNREAD_COUNT'; payload: { chatId: string } }
  | { type: 'SET_MESSAGES_LOADED'; payload: boolean };

const initialState: ChatState = {
  currentChat: null,
  messages: [],
  chats: [],
  chatLoading: false,
  chatsLoading: false,
  messagesLoaded: false,
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_CURRENT_CHAT':
      return {
        ...state,
        currentChat: action.payload,
        messagesLoaded: false,
        messages: [],
      };

    case 'SET_MESSAGES':
      const messages = Array.isArray(action.payload) ? action.payload : [];
      return {
        ...state,
        messages,
        messagesLoaded: true,
      };

    case 'SET_CHATS':
      const chats = Array.isArray(action.payload) ? action.payload : [];
      return { ...state, chats };

    case 'UPDATE_SEEN':
      if (!Array.isArray(state.messages)) {
        console.error('Messages is not an array:', state.messages);
        return state;
      }
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.id ? { ...msg, ...action.payload } : msg
        ),
      };

    case 'ADD_MESSAGE':
      if (!Array.isArray(state.messages)) {
        console.error(
          'Messages is not an array when adding message:',
          state.messages
        );
        return { ...state, messages: [action.payload] };
      }
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };

    case 'UPDATE_MESSAGE':
      if (!Array.isArray(state.messages)) {
        console.error(
          'Messages is not an array when updating message:',
          state.messages
        );
        return state;
      }
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.tempId ? action.payload.newMessage : msg
        ),
      };

    case 'RESET_CHAT_UNREAD_COUNT':
      if (
        !state.messagesLoaded ||
        state.currentChat?.id !== action.payload.chatId
      ) {
        return state;
      }
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat.id === action.payload.chatId ? { ...chat, unreadCount: 0 } : chat
        ),
      };

    case 'SET_MESSAGES_LOADED':
      return {
        ...state,
        messagesLoaded: action.payload,
      };

    default:
      return state;
  }
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const ChatProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useUser();
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const trpcUtils = api.useUtils();

  const {
    data: chatsData,
    isLoading: chatsLoading,
    refetch: refetchChats,
  } = api.chat.getChats.useQuery(undefined, {
    enabled: !!user?.id,
  });

  const { data: messagesData, isLoading: chatLoading } =
    api.chat.getMessages.useQuery(
      { chatId: state.currentChat?.id ?? '' },
      {
        enabled: !!state.currentChat?.id,
      }
    );

  const getOrCreateChatMutation = api.chat.getOrCreateChat.useMutation({
    onSuccess: (data: any) => {
      const { chat, isNew } = data;

      if (isNew && socket) {
        socket.emit('chat-list-update', { userId: chat.participants[1]?.id });
      }

      handleSetCurrChat(chat);

      const existingChatIndex = state.chats.findIndex((c) => c.id === chat.id);
      if (existingChatIndex === -1) {
        const newChats = [chat, ...state.chats];
        dispatch({ type: 'SET_CHATS', payload: newChats });
      }
    },
    onError: (error: any) => {
      console.error('Error getting/creating chat:', error);
    },
    onSettled: async () => {
      await trpcUtils.chat.getChats.invalidate();
    },
  });

  const deleteMessagesMutation = api.chat.deleteMessages.useMutation({
    onSettled: async () => {
      await trpcUtils.chat.getMessages.invalidate();
    },
    onError: (error: any) => {
      console.error('Error deleting messages:', error);
    },
  });

  const setChats = (newChats: Chat[]) => {
    dispatch({ type: 'SET_CHATS', payload: newChats });
  };

  const updateMessage = (tempId: string, newMessage: Message) => {
    dispatch({ type: 'UPDATE_MESSAGE', payload: { tempId, newMessage } });
  };

  const setMessages = (newMessages: Message[]) => {
    dispatch({ type: 'SET_MESSAGES', payload: newMessages });
  };

  const addMessage = (message: Message) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  };

  const closeChat = () => {
    dispatch({ type: 'SET_CURRENT_CHAT', payload: null });
    dispatch({ type: 'SET_MESSAGES_LOADED', payload: false });
  };

  const resetChatUnreadCount = (chatId: string) => {
    dispatch({ type: 'RESET_CHAT_UNREAD_COUNT', payload: { chatId } });
  };

  const handleSetCurrChat = async (chatData: Chat) => {
    if (socket) {
      socket.emit('JOIN', { chatId: chatData.id });
    }

    dispatch({ type: 'SET_CURRENT_CHAT', payload: chatData });
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

  const refreshChats = useCallback(async () => {
    try {
      await refetchChats();
    } catch (error) {
      console.error('Error refreshing chats:', error);
    }
  }, [refetchChats]);

  const updateSeen = (updatedMessage: Message) => {
    dispatch({ type: 'UPDATE_SEEN', payload: updatedMessage });
  };

  // Update chats when tRPC data changes
  useEffect(() => {
    if (chatsData?.chats) {
      dispatch({ type: 'SET_CHATS', payload: chatsData.chats });
    }
  }, [chatsData]);

  // Update messages when tRPC data changes
  useEffect(() => {
    if (messagesData?.messages) {
      dispatch({ type: 'SET_MESSAGES', payload: messagesData.messages });

      if (state.currentChat?.id && state.currentChat.unreadCount > 0) {
        resetChatUnreadCount(state.currentChat.id);
      }
    }
  }, [messagesData, state.currentChat?.id]);

  useEffect(() => {
    if (socket) {
      socket.on('chat-list-update', () => {
        refreshChats();
      });
    }

    return () => {
      socket?.off('CHAT_UPDATE');
      socket?.off('chat-list-update');
    };
  }, [socket, refreshChats]);

  const contextValue: ChatContextType = {
    currentChat: state.currentChat,
    messages: state.messages,
    chatLoading,
    chatsLoading,
    chats: state.chats,
    messagesLoaded: state.messagesLoaded,
    handleSetCurrChat,
    refreshChats,
    setMessages,
    addMessage,
    updateSeen,
    updateMessage,
    closeChat,
    setChats,
    getOrCreateChat,
    deleteMessages,
    resetChatUnreadCount,
    getOrCreateChatLoading: getOrCreateChatMutation.isLoading,
    deleteMessagesLoading: deleteMessagesMutation.isLoading,
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
export type { User, Message, Chat, ChatContextType };
