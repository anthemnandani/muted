'use client';

import { useOptimisticAction } from '@/contexts/OptimisticActionContext';
import { Bookmark } from '@/lib/types';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

interface UseBookmarkProps {
  bookmarksCount?: number;
  bookmarks?: Bookmark[];
  postId: string;
  collectionId?: string;
}

const useBookmark = ({
  bookmarksCount: initialCount,
  bookmarks,
  postId,
  collectionId,
}: UseBookmarkProps) => {
  const performAction = useOptimisticAction();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user: loggedUser } = useUser();

  const isBookmarkedInitial = useMemo(() => {
    return (
      bookmarks?.some((bookmark) => bookmark.userId === loggedUser?.id) || false
    );
  }, [bookmarks, loggedUser?.id]);

  const isBookmarkedInTargetInitial = useMemo(() => {
    return (
      bookmarks?.some(
        (bookmark) =>
          bookmark.userId === loggedUser?.id &&
          collectionId &&
          bookmark.collection?.id === collectionId
      ) || false
    );
  }, [bookmarks, loggedUser?.id, collectionId]);

  const hasNonDefaultBookmarks = useMemo(() => {
    return (
      bookmarks?.some(
        (bookmark) =>
          bookmark.userId === loggedUser?.id && !bookmark?.collection?.isDefault
      ) || false
    );
  }, [bookmarks, loggedUser?.id]);

  const [isBookmarkedByMe, setIsBookmarkedByMe] = useState(isBookmarkedInitial);
  const [isBookmarkedInTarget, setIsBookmarkedInTarget] = useState(
    isBookmarkedInTargetInitial
  );
  const [bookmarksCount, setBookmarksCount] = useState(initialCount ?? 0);

  useEffect(() => {
    setIsBookmarkedByMe(isBookmarkedInitial);
    setBookmarksCount(initialCount ?? 0);
  }, [isBookmarkedInitial, initialCount]);

  useEffect(() => {
    setIsBookmarkedInTarget(isBookmarkedInTargetInitial);
  }, [isBookmarkedInTargetInitial]);

  const { mutate: serverToggleBookmark } =
    api.collection.toggleBookmark.useMutation();

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const toggleBookmark = async (removeFromAll?: boolean) => {
    if (!loggedUser || !postId) {
      toast.error('Log in to bookmark');
      return;
    }

    let intent: boolean;

    if (removeFromAll) {
      intent = false;
    } else if (collectionId) {
      intent = !isBookmarkedInTarget;
    } else {
      intent = !isBookmarkedByMe;
    }

    if (intent) {
      if (!isBookmarkedByMe) {
        setIsBookmarkedByMe(true);
        setBookmarksCount((prev) => prev + 1);
      }
      if (collectionId) {
        setIsBookmarkedInTarget(true);
      }
    } else {
      if (removeFromAll || !collectionId) {
        setIsBookmarkedByMe(false);
        setBookmarksCount((prev) => Math.max(0, prev - 1));
        setIsBookmarkedInTarget(false);
      } else {
        const myBookmarks =
          bookmarks?.filter((b) => b.userId === loggedUser.id) || [];
        const isLastBookmark = myBookmarks.length === 1 && isBookmarkedInTarget;

        if (isLastBookmark) {
          setIsBookmarkedByMe(false);
          setBookmarksCount((prev) => Math.max(0, prev - 1));
        }
        setIsBookmarkedInTarget(false);
      }
    }

    if (performAction) {
      performAction(postId, 'BOOKMARK', intent, {
        collectionId,
        removeFromAll,
      });
    }

    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

    debounceTimeoutRef.current = setTimeout(() => {
      serverToggleBookmark({
        postId,
        isDefault: !collectionId,
        collectionId,
        removeFromAll,
        intent,
      });
    }, 1000);
  };

  return {
    toggleBookmark,
    isBookmarkedByMe,
    isBookmarkedInTarget,
    bookmarksCount,
    hasNonDefaultBookmarks,
  };
};

export default useBookmark;
