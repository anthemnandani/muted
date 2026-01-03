import { InfiniteData } from '@tanstack/react-query';

type LikeableItem = {
  id: string;
  likesCount: number;
  likes: { userId: string }[];
  [key: string]: any;
};

type PageWithList<TItem extends LikeableItem, K extends string> = {
  [key in K]: TItem[];
} & {
  [key: string]: any;
};

export const updateListInCache = <
  TItem extends LikeableItem,
  K extends string,
  TPage extends PageWithList<TItem, K>
>(
  oldData: InfiniteData<TPage> | undefined,
  listKey: K,
  targetId: string,
  userId: string,
  willBeLiked: boolean
): InfiniteData<TPage> | undefined => {
  if (!oldData) return undefined;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      [listKey]: page[listKey].map((item: any) => {
        if (item.id !== targetId) return item;
        return applyLikeUpdate(item, userId, willBeLiked);
      }),
    })),
  };
};

export const updateSingleItemInCache = <T extends LikeableItem>(
  oldData: T | undefined | null,
  userId: string,
  willBeLiked: boolean
): T | undefined | null => {
  if (!oldData) return oldData;
  return applyLikeUpdate(oldData, userId, willBeLiked);
};

const applyLikeUpdate = <T extends LikeableItem>(
  item: T,
  userId: string,
  willBeLiked: boolean
): T => {
  return {
    ...item,
    likesCount: willBeLiked
      ? item.likesCount + 1
      : Math.max(0, item.likesCount - 1),
    likes: willBeLiked
      ? [...item.likes, { userId }]
      : item.likes.filter((l) => l.userId !== userId),
  };
};
