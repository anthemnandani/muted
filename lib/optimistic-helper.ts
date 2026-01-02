import { InfiniteData } from '@tanstack/react-query';

export const updatePostLikeStatus = (
  post: any,
  currentUserId: string,
  isLiking: boolean
) => {
  const isCurrentlyLiked = post.likes.some(
    (l: any) => l.userId === currentUserId
  );
  if (isLiking === isCurrentlyLiked) return post;

  let newLikes = [...post.likes];
  if (isLiking) {
    newLikes.push({ userId: currentUserId });
  } else {
    newLikes = newLikes.filter((l: any) => l.userId !== currentUserId);
  }

  return {
    ...post,
    likes: newLikes,
    likesCount: isLiking
      ? (post.likesCount || 0) + 1
      : (post.likesCount || 0) - 1,
  };
};

export const updateInfiniteData = (
  oldData: InfiniteData<any> | undefined,
  postId: string,
  currentUserId: string,
  isLiking: boolean,
  arrayKey: string = 'posts'
) => {
  if (!oldData) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => {
      if (arrayKey.includes('.')) {
        const [parentKey, childKey] = arrayKey.split('.');
        if (!page[parentKey]) return page;

        return {
          ...page,
          [parentKey]: {
            ...page[parentKey],
            [childKey]: page[parentKey][childKey].map((post: any) =>
              post.id === postId
                ? updatePostLikeStatus(post, currentUserId, isLiking)
                : post
            ),
          },
        };
      }

      if (!page[arrayKey]) return page;

      return {
        ...page,
        [arrayKey]: page[arrayKey].map((post: any) =>
          post.id === postId
            ? updatePostLikeStatus(post, currentUserId, isLiking)
            : post
        ),
      };
    }),
  };
};
