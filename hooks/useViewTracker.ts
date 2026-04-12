import { ViewContentType, ViewSource } from '@/generated/prisma/enums';
import {
  MAX_VIEW_DURATION_MS,
  MIN_VIEW_DURATION_MS,
} from '@/lib/view-constants';
import { useViewTrackingStore } from '@/store/viewTracking';
import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

interface UseViewTrackerOptions {
  postId?: string;
  threadId?: string;
  source: ViewSource;
  contentType: ViewContentType;
  skip?: boolean;
}

export function useViewTracker({
  postId,
  threadId,
  source,
  contentType,
  skip,
}: UseViewTrackerOptions) {
  const { ref, inView } = useInView({ threshold: 0.5 });
  const startTimeRef = useRef<number | null>(null);
  const addEvent = useViewTrackingStore((s) => s.addEvent);
  const enabled =
    contentType !== ViewContentType.VIDEO ||
    source !== ViewSource.THREAD_DETAIL ||
    !skip;

  useEffect(() => {
    if (!enabled) return;

    if (inView) {
      startTimeRef.current = Date.now();
    } else if (startTimeRef.current !== null) {
      const raw = Date.now() - startTimeRef.current;
      const durationMs = Math.min(raw, MAX_VIEW_DURATION_MS);
      startTimeRef.current = null;
      if (durationMs >= MIN_VIEW_DURATION_MS) {
        addEvent({ postId, threadId, durationMs, source, contentType });
      }
    }
  }, [inView, enabled]);

  useEffect(() => {
    return () => {
      if (startTimeRef.current !== null) {
        const durationMs = Date.now() - startTimeRef.current;
        startTimeRef.current = null;
        if (durationMs >= MIN_VIEW_DURATION_MS) {
          addEvent({ postId, threadId, durationMs, source, contentType });
        }
      }
    };
  }, []);

  return { ref };
}
