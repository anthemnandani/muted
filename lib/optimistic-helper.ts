import type { Post } from './types';

export type ACTION_TYPE = 'LIKE' | 'BOOKMARK';

const recipes = {
  LIKE: (item: Post, userId: string, active: boolean) => ({
    ...item,
    likesCount: active
      ? (item.likesCount || 0) + 1
      : Math.max(0, (item.likesCount || 0) - 1),
    likes: active
      ? [...(item.likes || []), { userId }]
      : (item.likes || []).filter((l) => l.userId !== userId),
  }),

  BOOKMARK: (
    item: Post,
    userId: string,
    active: boolean,
    payload?: { collectionId: string; removeFromAll?: boolean }
  ) => {
    const currentBookmarks = item.bookmarks || [];
    const targetCollectionId = payload?.collectionId;
    const removeFromAll = payload?.removeFromAll;

    const isBookmarkedGlobally = currentBookmarks.some(
      (b) => b.userId === userId
    );

    if (active) {
      const isAlreadyInTarget = targetCollectionId
        ? currentBookmarks.some(
            (b) =>
              b.userId === userId && b.collection?.id === targetCollectionId
          )
        : isBookmarkedGlobally;

      if (isAlreadyInTarget) return item;

      const newCount = !isBookmarkedGlobally
        ? (item.bookmarksCount || 0) + 1
        : item.bookmarksCount;

      return {
        ...item,
        bookmarksCount: newCount,
        bookmarks: [
          ...currentBookmarks,
          {
            userId,
            collection: {
              id: targetCollectionId,
              isDefault: !targetCollectionId,
            },
          },
        ],
      };
    } else {
      let newBookmarks = [...currentBookmarks];

      if (removeFromAll) {
        newBookmarks = newBookmarks.filter((b) => b.userId !== userId);
      } else if (targetCollectionId) {
        newBookmarks = newBookmarks.filter(
          (b) =>
            !(b.userId === userId && b.collection?.id === targetCollectionId)
        );
      } else {
        newBookmarks = newBookmarks.filter((b) => b.userId !== userId);
      }

      const userStillHasBookmarks = newBookmarks.some(
        (b) => b.userId === userId
      );

      const newCount =
        !userStillHasBookmarks && isBookmarkedGlobally
          ? Math.max(0, (item.bookmarksCount || 0) - 1)
          : item.bookmarksCount;

      return {
        ...item,
        bookmarksCount: newCount,
        bookmarks: newBookmarks,
      };
    }
  },
};

export const applyOptimisticUpdate = (
  oldData: any,
  listKey: string,
  targetId: string,
  action: ACTION_TYPE,
  userId: string,
  active: boolean,
  payload?: { collectionId: string; removeFromAll?: boolean }
) => {
  if (!oldData) return oldData;

  if (oldData.pages) {
    return {
      ...oldData,
      pages: oldData.pages.map((page: any) => ({
        ...page,
        [listKey]: page[listKey].map((item: any) => {
          if (item.id !== targetId) return item;
          return recipes[action](item, userId, active, payload);
        }),
      })),
    };
  }

  const keys = Object.keys(oldData);
  for (const key of keys) {
    if (oldData[key]?.id === targetId) {
      return {
        ...oldData,
        [key]: recipes[action](oldData[key], userId, active, payload),
      };
    }
  }

  return oldData;
};
