'use client';

import { PostProps } from '@/lib/types';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const useBookmark = (
  bookmarkInfo?: Pick<PostProps, 'id' | 'bookmarks' | 'bookmarksCount'>
) => {
  const trpcUtils = api.useUtils();
  const {
    bookmarksCount: initialCount,
    bookmarks,
    id: postId,
  } = bookmarkInfo || {};
  const { user: loggedUser } = useUser();

  const isBookmarkedInitial = useMemo(() => {
    return (
      bookmarks?.some((bookmark) => bookmark.userId === loggedUser?.id) || false
    );
  }, [bookmarks, loggedUser?.id]);

  const hasNonDefaultBookmarks = useMemo(() => {
    return (
      bookmarks?.some(
        (bookmark) =>
          bookmark.userId === loggedUser?.id && !bookmark?.collection?.isDefault
      ) || false
    );
  }, [bookmarks, loggedUser?.id]);

  const [isBookmarkedByMe, setIsBookmarkedByMe] = useState(isBookmarkedInitial);
  const [bookmarksCount, setBookmarksCount] = useState(initialCount ?? 0);

  useEffect(() => {
    setIsBookmarkedByMe(isBookmarkedInitial);
    setBookmarksCount(initialCount ?? 0);
  }, [postId]);

  const { mutateAsync: toggleBookmark, isPending } =
    api.collection.toggleBookmark.useMutation({
      onMutate: async () => {
        const newIsBookmarked = !isBookmarkedByMe;
        setIsBookmarkedByMe(newIsBookmarked);
        setBookmarksCount((prev) => (newIsBookmarked ? prev + 1 : prev - 1));
      },
      onError: (err) => {
        setIsBookmarkedByMe(isBookmarkedInitial);
        setBookmarksCount(initialCount ?? 0);
        toast.error('Failed to update bookmark');
      },
      retry: false,
    });

  return {
    toggleBookmark,
    isBookmarkedByMe,
    bookmarksCount,
    hasNonDefaultBookmarks,
    isLoading: isPending,
  };
};

export default useBookmark;
