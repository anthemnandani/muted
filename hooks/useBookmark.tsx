'use client';

import { PostProps } from '@/lib/types';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';

const useBookmark = ({
  bookmarkInfo,
}: {
  bookmarkInfo: Pick<PostProps, 'id' | 'bookmarks' | 'bookmarksCount'>;
}) => {
  const trpcUtils = api.useUtils();
  const { bookmarksCount, bookmarks } = bookmarkInfo;
  const { user: loggedUser } = useUser();

  const isBookmarkedByMe =
    bookmarks?.some((bookmark) => bookmark.userId === loggedUser?.id) || false;

  const { mutate: toggleBookmark, isLoading } =
    api.collection.toggleBookmark.useMutation({
      onSettled: async () => {
        await trpcUtils.post.getInfinitePosts.invalidate();
        await trpcUtils.post.getNestedPosts.invalidate({
          id: bookmarkInfo.id as string,
        });
        await trpcUtils.user.postInfo.invalidate({});
        await trpcUtils.post.getSavedPosts.invalidate();
        await trpcUtils.collection.getUserCollections.invalidate();
      },
    });

  return { toggleBookmark, isBookmarkedByMe, bookmarksCount, isLoading };
};

export default useBookmark;
