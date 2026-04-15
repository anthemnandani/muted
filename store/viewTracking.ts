import { REPLAY_CAP, VIEW_THRESHOLDS } from '@/lib/view-constants';
import type { ViewContentTypeValue, ViewEvent } from '@/lib/types';
import { create } from 'zustand';

interface SeenEntry {
  count: number;
  hasQualifiedView: boolean;
}

interface ViewTrackingStore {
  pendingEvents: ViewEvent[];
  seenMap: Map<string, SeenEntry>;
  viewedIds: Map<string, Set<string>>;
  addEvent: (event: ViewEvent) => void;
  hasBeenViewed: (id: string, contentType: ViewContentTypeValue) => boolean;
  flushEvents: () => ViewEvent[];
}

export const useViewTrackingStore = create<ViewTrackingStore>((set, get) => ({
  pendingEvents: [],
  seenMap: new Map(),
  viewedIds: new Map(),

  addEvent: (event) => {
    const key = event.postId ?? event.threadId ?? '';
    if (!key) return;

    const { seenMap, pendingEvents, viewedIds } = get();
    const existing = seenMap.get(key) ?? { count: 0, hasQualifiedView: false };

    // Prevent duplicate / over tracking
    if (event.contentType !== 'VIDEO' && existing.hasQualifiedView) return;
    if (event.contentType === 'VIDEO' && existing.count >= REPLAY_CAP) return;

    const threshold =
      VIEW_THRESHOLDS[event.contentType as keyof typeof VIEW_THRESHOLDS] ?? 1500;

    const qualifies = event.durationMs >= threshold;

    const newSeenMap = new Map(seenMap);
    newSeenMap.set(key, {
      count: existing.count + 1,
      hasQualifiedView: existing.hasQualifiedView || qualifies,
    });

    // Track viewed content types
    const newViewedIds = new Map(viewedIds);
    if (!newViewedIds.has(key)) {
      newViewedIds.set(key, new Set());
    }
    newViewedIds.get(key)!.add(event.contentType);

    // Fire API (optional but useful)
    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch(() => {});

    set({
      pendingEvents: [...pendingEvents, event],
      seenMap: newSeenMap,
      viewedIds: newViewedIds,
    });
  },

  hasBeenViewed: (id, contentType) => {
    const viewed = get().viewedIds.get(id);
    return viewed?.has(contentType) ?? false;
  },

  flushEvents: () => {
    const { pendingEvents } = get();
    set({ pendingEvents: [] });
    return pendingEvents;
  },
}));