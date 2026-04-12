import { REPLAY_CAP, VIEW_THRESHOLDS } from '@/lib/view-constants';
import type { ViewEvent } from '@/lib/types';
import { create } from 'zustand';

interface SeenEntry {
  count: number;
  hasQualifiedView: boolean;
}

interface ViewTrackingStore {
  pendingEvents: ViewEvent[];
  seenMap: Map<string, SeenEntry>;
  addEvent: (event: ViewEvent) => void;
  flushEvents: () => ViewEvent[];
}

export const useViewTrackingStore = create<ViewTrackingStore>((set, get) => ({
  pendingEvents: [],
  seenMap: new Map(),

  addEvent: (event) => {
    const key = event.postId ?? event.threadId ?? '';
    if (!key) return;

    const { seenMap, pendingEvents } = get();
    const existing = seenMap.get(key) ?? { count: 0, hasQualifiedView: false };

    if (event.contentType !== 'VIDEO' && existing.hasQualifiedView) return;
    if (event.contentType === 'VIDEO' && existing.count >= REPLAY_CAP) return;

    const threshold =
      VIEW_THRESHOLDS[event.contentType as keyof typeof VIEW_THRESHOLDS] ??
      1500;
    const qualifies = event.durationMs >= threshold;

    const newSeenMap = new Map(seenMap);
    newSeenMap.set(key, {
      count: existing.count + 1,
      hasQualifiedView: existing.hasQualifiedView || qualifies,
    });

    set({
      pendingEvents: [...pendingEvents, event],
      seenMap: newSeenMap,
    });
  },

  flushEvents: () => {
    const { pendingEvents } = get();
    set({ pendingEvents: [] });
    return pendingEvents;
  },
}));
