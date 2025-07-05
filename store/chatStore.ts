import { Chat, Message, ViewMode } from '@/lib/types';
import { create } from 'zustand';

interface ChatState {
  currentChat: Chat | null;
  setCurrentChat: (chat: Chat | null) => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
  messageRequests: Chat[];
  setMessageRequests: (requests: Chat[]) => void;
  messageRequestsCount: number;
  setMessageRequestsCount: (value: number) => void;
  viewMode: ViewMode;
  setViewMode: (viewMode: ViewMode) => void;
}

const useChatStore = create<ChatState>((set) => ({
  currentChat: null,
  setCurrentChat: (chat) => set({ currentChat: chat }),
  messages: [],
  setMessages: (messages) => set({ messages }),
  chats: [],
  setChats: (chats) => set({ chats }),
  messageRequests: [],
  setMessageRequests: (requests) => set({ messageRequests: requests }),
  messageRequestsCount: 0,
  setMessageRequestsCount: (count) => set({ messageRequestsCount: count }),
  viewMode: 'chats',
  setViewMode: (viewMode) => set({ viewMode }),
}));

export default useChatStore;
