import { create } from 'zustand';
import type { ParentPostProps } from '@/lib/types';

interface SinglePostStore {
  activePost: ParentPostProps | null;
  setActivePost: (post: ParentPostProps) => void;
}

const useSinglePostStore = create<SinglePostStore>((set) => ({
  activePost: null,
  setActivePost: (post) => set({ activePost: post }),
}));

export default useSinglePostStore;
