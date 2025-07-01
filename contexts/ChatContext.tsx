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
import { MessageRequestStatus, MessageStatus } from '@prisma/client';
import { toast } from 'sonner';
import { RECEIVE_MSG_EVENT } from '@/lib/socket-events';

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

interface ChatState {
  currentChat: Chat | null;
  messages: Message[];
  chats: Chat[];
  messageRequests: Chat[];
  messageRequestsCount: number;
  chatLoading: boolean;
  chatsLoading: boolean;
  messagesLoaded: boolean;
}

interface ChatContextType extends ChatState {
  handleSetCurrChat: (chat: Chat) => void;
  updateCurrentChat: (chat: Chat) => void;
  refreshChats: () => Promise<void>;
  setMessages: (messages: Message[]) => void;
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

type ChatAction =
  | { type: 'SET_CURRENT_CHAT'; payload: Chat | null }
  | { type: 'UPDATE_CURRENT_CHAT'; payload: Chat }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | {
      type: 'SET_CHATS_DATA';
      payload: {
        chats: Chat[];
        messageRequests: Chat[];
        messageRequestsCount: number;
      };
    }
  | { type: 'SET_CHATS'; payload: Chat[] }
  | { type: 'REMOVE_CHAT'; payload: { chatId: string } }
  | { type: 'UPDATE_SEEN'; payload: Message }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { tempId: string; newMessage: Message } }
  | { type: 'RESET_CHAT_UNREAD_COUNT'; payload: { chatId: string } }
  | { type: 'SET_MESSAGES_LOADED'; payload: boolean }
  | {
      type: 'UPDATE_CHAT_LAST_MESSAGE';
      payload: { chatId: string; message: Message };
    }
  | { type: 'UPDATE_CHAT_IN_LIST'; payload: Chat };

const initialState: ChatState = {
  currentChat: null,
  messages: [],
  chats: [],
  messageRequests: [],
  messageRequestsCount: 0,
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

    case 'UPDATE_CURRENT_CHAT':
      return {
        ...state,
        currentChat: action.payload,
      };

    case 'SET_MESSAGES':
      const messages = Array.isArray(action.payload) ? action.payload : [];
      return {
        ...state,
        messages,
        messagesLoaded: true,
      };

    case 'SET_CHATS_DATA':
      return {
        ...state,
        chats: action.payload.chats,
        messageRequests: action.payload.messageRequests,
        messageRequestsCount: action.payload.messageRequestsCount,
      };

    case 'SET_CHATS':
      const chats = Array.isArray(action.payload) ? action.payload : [];
      return { ...state, chats };

    case 'REMOVE_CHAT':
      return {
        ...state,
        chats: state.chats.filter((chat) => chat.id !== action.payload.chatId),
        messageRequests: state.messageRequests.filter(
          (chat) => chat.id !== action.payload.chatId
        ),
        currentChat:
          state.currentChat?.id === action.payload.chatId
            ? null
            : state.currentChat,
      };

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

    case 'UPDATE_CHAT_IN_LIST':
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat.id === action.payload.id ? action.payload : chat
        ),
        currentChat:
          state.currentChat?.id === action.payload.id
            ? action.payload
            : state.currentChat,
      };

    case 'UPDATE_CHAT_LAST_MESSAGE':
      const updatedChats = state.chats.map((chat) => {
        if (chat.id === action.payload.chatId) {
          return {
            ...chat,
            lastMessage: action.payload.message,
            lastMessageAt: new Date(action.payload.message.createdAt),
          };
        }
        return chat;
      });

      const sortedChats = [...updatedChats].sort((a, b) => {
        const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return bTime - aTime;
      });

      return {
        ...state,
        chats: sortedChats,
        currentChat:
          state.currentChat?.id === action.payload.chatId
            ? {
                ...state.currentChat,
                lastMessage: action.payload.message,
                lastMessageAt: new Date(action.payload.message.createdAt),
              }
            : state.currentChat,
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
      const { chat } = data;

      handleSetCurrChat(chat);

      const existingChatIndex = state.chats.findIndex((c) => c.id === chat.id);
      if (existingChatIndex === -1) {
        const newChats = [chat, ...state.chats];
        dispatch({ type: 'SET_CHATS', payload: newChats });
      } else {
        dispatch({ type: 'UPDATE_CHAT_IN_LIST', payload: chat });
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
      if (state.currentChat) {
        dispatch({ type: 'SET_MESSAGES', payload: [] });
        toast.success('Messages cleared');
      }
    },
    onSettled: async () => {
      await trpcUtils.chat.getChats.invalidate();
    },
    onError: (error: any) => {
      console.error('Error deleting messages:', error);
      toast.error('Failed to clear messages');
    },
  });

  const deleteChatMutation = api.chat.deleteChat.useMutation({
    onSuccess: (_, variables) => {
      dispatch({ type: 'REMOVE_CHAT', payload: { chatId: variables.chatId } });
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

  const setChats = (newChats: Chat[]) => {
    dispatch({ type: 'SET_CHATS', payload: newChats });
  };

  const updateMessage = (tempId: string, newMessage: Message) => {
    dispatch({ type: 'UPDATE_MESSAGE', payload: { tempId, newMessage } });

    if (newMessage.status === MessageStatus.SENT) {
      updateChatLastMessage(newMessage.chatId, newMessage);
    }
  };

  const setMessages = (newMessages: Message[]) => {
    dispatch({ type: 'SET_MESSAGES', payload: newMessages });
  };

  const addMessage = (message: Message) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
    updateChatLastMessage(message.chatId, message);
  };

  const closeChat = () => {
    dispatch({ type: 'SET_CURRENT_CHAT', payload: null });
    dispatch({ type: 'SET_MESSAGES_LOADED', payload: false });
  };

  const resetChatUnreadCount = (chatId: string) => {
    dispatch({ type: 'RESET_CHAT_UNREAD_COUNT', payload: { chatId } });
  };

  const updateCurrentChat = (chatData: Chat) => {
    dispatch({ type: 'UPDATE_CURRENT_CHAT', payload: chatData });
  };

  const updateChatLastMessage = (chatId: string, message: Message) => {
    dispatch({
      type: 'UPDATE_CHAT_LAST_MESSAGE',
      payload: { chatId, message },
    });
  };

  const handleSetCurrChat = (chatData: Chat) => {
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
    dispatch({ type: 'UPDATE_SEEN', payload: updatedMessage });
  };

  useEffect(() => {
    if (chatsData) {
      dispatch({
        type: 'SET_CHATS_DATA',
        payload: {
          chats: chatsData.chats || [],
          messageRequests: chatsData.messageRequests || [],
          messageRequestsCount: chatsData.messageRequestsCount || 0,
        },
      });
    }
  }, [chatsData]);

  useEffect(() => {
    if (messagesData?.messages) {
      dispatch({ type: 'SET_MESSAGES', payload: messagesData.messages });

      if (state.currentChat?.id && state.currentChat.unreadCount > 0) {
        resetChatUnreadCount(state.currentChat.id);
      }
    }
  }, [messagesData, state.currentChat?.id]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg: Message) => {
      if (msg.chatId === state.currentChat?.id) {
        addMessage(msg);
      }
    };

    const handleSeenMessageUpdate = ({
      updatedMsg,
    }: {
      updatedMsg: Message;
    }) => {
      if (updatedMsg && state.currentChat?.id) {
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
      if (state.currentChat?.id === chatId) {
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
    state.currentChat?.id,
    addMessage,
    updateSeen,
    refreshChats,
    updateCurrentChat,
  ]);

  const contextValue: ChatContextType = {
    currentChat: state.currentChat,
    messages: state.messages,
    chatLoading,
    chatsLoading,
    chats: state.chats,
    messageRequests: state.messageRequests,
    messageRequestsCount: state.messageRequestsCount,
    messagesLoaded: state.messagesLoaded,
    handleSetCurrChat,
    updateCurrentChat,
    refreshChats,
    setMessages,
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
export type { User, Message, Chat, ChatContextType };
