import { ViewContentType, ViewSource } from '@/generated/prisma/enums';
import { useViewTrackingStore } from '@/store/viewTracking';
import { useEffect, useRef } from 'react';

interface UseVideoViewTrackerOptions {
  postId?: string;
  threadId?: string;
  source?: ViewSource;
  enabled?: boolean;
}

export function useVideoViewTracker({
  postId,
  threadId,
  source,
  enabled = true,
}: UseVideoViewTrackerOptions) {
  const accumulatedRef = useRef(0);
  const addEvent = useViewTrackingStore((s) => s.addEvent);

  const recordPlayback = (playedSeconds: number) => {
    if (!enabled) return;
    accumulatedRef.current += playedSeconds * 1000;
  };

  const flush = () => {
    if (!enabled || accumulatedRef.current === 0 || !source) return;
    addEvent({
      postId,
      threadId,
      durationMs: accumulatedRef.current,
      source,
      contentType: ViewContentType.VIDEO,
    });
    accumulatedRef.current = 0;
  };

  useEffect(() => {
    return () => {
      flush();
    };
  }, []);

  return { recordPlayback, flush };
}
