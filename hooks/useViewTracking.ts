'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { useViewTracking as useViewStore } from '@/store/viewTracking';
import { VIEW_INTERSECTION_THRESHOLD } from '@/lib/view-constants';
import type { ViewContentTypeValue, ViewSourceType } from '@/lib/types';

interface UseViewTrackingOptions {
  postId?: string;
  threadId?: string;
  contentType: ViewContentTypeValue;
  source: ViewSourceType;
  authorId: string;
  currentUserId: string;
  getPlaybackTimeMs?: () => number; // for video: returns actual playback ms
}

export function useViewTracker(options: UseViewTrackingOptions) {
  const {
    postId,
    threadId,
    contentType,
    source,
    authorId,
    currentUserId,
    getPlaybackTimeMs,
  } = options;

  const { addEvent, hasBeenViewed } = useViewStore();
  const startTimeRef = useRef<number | null>(null);
  const id = postId || threadId || '';
  const isSelf = authorId === currentUserId;

  const { ref, inView } = useInView({
    threshold: VIEW_INTERSECTION_THRESHOLD,
    triggerOnce: false,
  });

  const recordEvent = useCallback(() => {
    if (isSelf) return;
    if (hasBeenViewed(id, contentType)) return;

    let durationMs: number;
    if (contentType === 'VIDEO' && getPlaybackTimeMs) {
      durationMs = getPlaybackTimeMs();
    } else {
      if (!startTimeRef.current) return;
      durationMs = Date.now() - startTimeRef.current;
    }

    if (durationMs <= 0) return;

    addEvent({
      postId,
      threadId,
      durationMs,
      source,
      contentType,
      tier: 'VIEW', // server re-evaluates; client sends optimistically
    });
  }, [
    id,
    contentType,
    source,
    isSelf,
    getPlaybackTimeMs,
    addEvent,
    hasBeenViewed,
    postId,
    threadId,
  ]);

  useEffect(() => {
    if (inView) {
      startTimeRef.current = Date.now();
    } else if (startTimeRef.current) {
      recordEvent();
      startTimeRef.current = null;
    }
  }, [inView, recordEvent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recordEvent();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, inView };
}
