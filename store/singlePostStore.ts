import { create } from 'zustand';
import type { ParentPostProps } from '@/lib/types';
import type { TargetType } from '@/contexts/OptimisticActionContext';

interface SinglePostStore {
  activePost: ParentPostProps | null;
  feedTarget?: TargetType | null;
  setActivePost: (
    post: ParentPostProps | null,
    target: TargetType | null,
  ) => void;
  clearActivePost: () => void;
}

const useSinglePostStore = create<SinglePostStore>((set) => ({
  activePost: null,
  feedTarget: null,

  setActivePost: (post, target = null) =>
    set({ activePost: post, feedTarget: target }),

  clearActivePost: () => set({ activePost: null, feedTarget: null }),
}));

export default useSinglePostStore;
