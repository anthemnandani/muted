'use client';

import { PostProps } from '@/lib/types';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { useMemo } from 'react';

const useBookmark = (
  bookmarkInfo?: Pick<PostProps, 'id' | 'bookmarks' | 'bookmarksCount'>
) => {
  const trpcUtils = api.useUtils();
  const { bookmarksCount, bookmarks } = bookmarkInfo || {};
  const { user: loggedUser } = useUser();

  const isBookmarkedByMe = useMemo(() => {
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

  const { mutateAsync: toggleBookmark, isLoading } =
    api.collection.toggleBookmark.useMutation({
      onSettled: async () => {
        await trpcUtils.invalidate();
      },
      retry: false,
    });

  return {
    toggleBookmark,
    isBookmarkedByMe,
    bookmarksCount,
    hasNonDefaultBookmarks,
    isLoading,
  };
};

export default useBookmark;
