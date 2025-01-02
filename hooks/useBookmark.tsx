// 'use client';
// import { PostProps } from '@/lib/types';
// import { api } from '@/trpc/react';
// import { useUser } from '@clerk/nextjs';
// import React from 'react';
// import { toast } from 'sonner';

// const useBookmark = ({
//   bookmarkInfo,
// }: {
//   bookmarkInfo: Pick<PostProps, 'id' | 'bookmarks' | 'bookmarksCount'>;
// }) => {
//   const { user: loggedUser } = useUser();

//   const { bookmarksCount: initialBookmarksCount, id, bookmarks } = bookmarkInfo;
//   const isBookmarkedByMeInitial =
//     bookmarks?.some((bookmark) => bookmark.userId === loggedUser?.id) || false;

//   const [isBookmarkedByMe, setIsBookmarkedByMe] = React.useState(
//     isBookmarkedByMeInitial
//   );
//   const [bookmarksCount, setBookmarksCount] = React.useState(
//     initialBookmarksCount || 0
//   );

//   React.useEffect(() => {
//     setIsBookmarkedByMe(isBookmarkedByMeInitial);
//     setBookmarksCount(initialBookmarksCount || 0);
//   }, [isBookmarkedByMeInitial, initialBookmarksCount]);
//   const trpcUtils = api.useUtils();

//   const { mutate: toggleBookmark, isLoading } =
//     api.post.toggleBookmark.useMutation({
//       onMutate: async () => {
//         setIsBookmarkedByMe((prev) => !prev);
//         setBookmarksCount((prev) => (isBookmarkedByMe ? prev - 1 : prev + 1));

//         return {
//           previousIsBookmarkedByMe: isBookmarkedByMe,
//           previousBookmarksCount: bookmarksCount,
//         };
//       },
//       onError: (error, variables, context) => {
//         if (
//           context?.previousIsBookmarkedByMe !== undefined &&
//           context?.previousBookmarksCount !== undefined
//         ) {
//           setIsBookmarkedByMe(context.previousIsBookmarkedByMe);
//           setBookmarksCount(context.previousBookmarksCount);
//         }
//         toast.error('Something went wrong!');
//       },
//       onSuccess: () => {
//         toast.success(isBookmarkedByMe ? 'Saved!' : 'Unsaved!', {
//           richColors: true,
//         });
//       },
//       onSettled: async () => {
//         await trpcUtils.invalidate();
//       },
//     });

//   return { toggleBookmark, isBookmarkedByMe, bookmarksCount, isLoading };
// };

// export default useBookmark;
