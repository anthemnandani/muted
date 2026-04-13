import { create } from 'zustand';

interface ViewEvent {
  postId?: string;
  threadId?: string;
  durationMs: number;
  source: string;
  contentType: string;
  tier: string;
}

interface ViewTrackingStore {
  events: ViewEvent[];
  viewedIds: Map<string, Set<string>>; // id -> Set of contentTypes
  addEvent: (event: ViewEvent) => void;
  hasBeenViewed: (id: string, contentType: string) => boolean;
  clearEvents: () => void;
}

export const useViewTracking = create<ViewTrackingStore>((set, get) => ({
  events: [],
  viewedIds: new Map(),

  addEvent: (event) => {
    const id = event.postId || event.threadId || '';
    if (!id) return;

    set((state) => {
      const viewedIds = new Map(state.viewedIds);
      if (!viewedIds.has(id)) {
        viewedIds.set(id, new Set());
      }
      viewedIds.get(id)!.add(event.contentType);

      return {
        events: [...state.events, event],
        viewedIds,
      };
    });

    // Fire-and-forget to your API
    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch(() => {}); // silent fail
  },

  hasBeenViewed: (id, contentType) => {
    const viewed = get().viewedIds.get(id);
    return viewed?.has(contentType) ?? false;
  },

  clearEvents: () => set({ events: [], viewedIds: new Map() }),
}));