// 'use client';

// import NavigationButtons from '@/components/buttons/NavigationButtons';
// import CommentsPanel from '@/components/comments/CommentsPanel';
// import PostMediaCarousel from '@/components/posts/PostMediaCarousel';
// import EmptyState from '@/components/shared/EmptyState';
// import PostCardSkeleton from '@/components/skeletons/PostCardSkeleton';
// import { Button } from '@/components/ui/button';
// import usePostStore from '@/store/postStore';
// import { api } from '@/trpc/react';
// import { Video, X } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { useCallback, useEffect, useMemo } from 'react';

// const PostDetailView = ({ postId: initialPostId }: { postId: string }) => {
//   const router = useRouter();

//   const {
//     currentPostId,
//     setCurrentPostId,
//     postList,
//     currentIndex,
//     setCurrentIndex,
//   } = usePostStore();

//   // 1. Determine Active ID
//   const activeId = currentPostId || initialPostId;

//   // 2. CHECK STORE: Do we already have this post?
//   // We use useMemo to avoid recalculating on every render
//   const cachedPost = useMemo(() => {
//     return postList?.find((p) => p.id === activeId);
//   }, [postList, activeId]);

//   // 3. Sync Store on direct load if needed
//   useEffect(() => {
//     if (!currentPostId) {
//       setCurrentPostId(initialPostId);
//     }
//   }, [initialPostId, currentPostId, setCurrentPostId]);

//   // 4. Fetch Data ONLY if we don't have it cached
//   const { data, isLoading, isError } = api.post.getPostDetails.useQuery(
//     { id: activeId },
//     {
//       staleTime: 10 * 60 * 1000,
//       retry: false,
//       refetchOnWindowFocus: false,
//       enabled: !cachedPost, // <--- INSTANT LOAD: Disable fetch if cached
//     }
//   );

//   const handleNavigation = useCallback(
//     (direction: 'up' | 'down') => {
//       if (!postList || postList.length === 0) return;

//       const foundIndex = postList.findIndex((p) => p.id === activeId);
//       const currIdx = foundIndex !== -1 ? foundIndex : currentIndex;

//       let newIndex = direction === 'down' ? currIdx + 1 : currIdx - 1;

//       if (newIndex >= 0 && newIndex < postList.length) {
//         const nextPost = postList[newIndex];
//         setCurrentIndex(newIndex);
//         setCurrentPostId(nextPost.id);
//         router.replace(`/post/${nextPost.id}`);
//       }
//     },
//     [
//       postList,
//       activeId,
//       currentIndex,
//       setCurrentIndex,
//       setCurrentPostId,
//       router,
//     ]
//   );

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'ArrowDown') handleNavigation('down');
//       if (e.key === 'ArrowUp') handleNavigation('up');
//     };
//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [handleNavigation]);

//   // 5. Determine which data to show (Cached vs Fetched)
//   const postToDisplay = cachedPost || data?.post;

//   if (isLoading && !cachedPost)
//     return (
//       <div className='relative w-full max-h-screen self-center'>
//         <PostCardSkeleton />
//       </div>
//     );

//   if (!postToDisplay && isError) {
//     return (
//       <div className='flex-center w-full h-full min-h-screen bg-background'>
//         <div className='flex flex-col items-center text-center'>
//           <EmptyState
//             icon={<Video className='size-11 text-white/90' />}
//             title='Post currently unavailable'
//             description='Try exploring the latest posts or starting a new search.'
//           />
//           <Button onClick={() => router.back()} className='mt-4'>
//             Go Back
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   const handleClose = () => {
//     if (window.history.length > 1) {
//       router.back();
//     } else {
//       router.push(`/@${postToDisplay?.author.username}`);
//     }
//   };

//   const hasNext = postList && currentIndex < postList.length - 1;
//   const hasPrev = postList && currentIndex > 0;

//   return (
//     <div className='fixed inset-0 z-[3000] flex w-full h-screen max-w-full bg-[#121212]'>
//       <button
//         type='button'
//         className='post-detail-btn absolute top-4 left-4 z-[3001]'
//         onClick={handleClose}
//       >
//         <X width={24} height={24} className='text-white stroke-[2.5px]' />
//       </button>

//       <NavigationButtons
//         isFirstPost={!hasPrev}
//         isLastPost={!hasNext}
//         // isLoading={isLoading}
//         handleNavigation={handleNavigation}
//       />

//       <div className='relative flex-[2] h-full flex-center overflow-hidden'>
//         <PostMediaCarousel
//           key={postToDisplay?.id}
//           media={postToDisplay?.media!}
//           author={postToDisplay?.author!}
//           createdAt={postToDisplay?.createdAt!}
//           mentions={postToDisplay?.mentions}
//           postId={postToDisplay?.id!}
//           text={postToDisplay?.text!}
//           pinned={postToDisplay?.pinned}
//           reposts={postToDisplay?.reposts!}
//           hideLikes={postToDisplay?.hideLikes}
//           turnOffComments={postToDisplay?.turnOffComments}
//           isModal
//         />
//       </div>

//       <div className='flex-1 h-full min-w-[350px] max-w-[500px] border-l border-zinc-800 bg-[#121212]'>
//         <CommentsPanel
//           key={`comments-${postToDisplay?.id}`}
//           postId={postToDisplay?.id!}
//           onClose={handleClose}
//           authorId={postToDisplay?.author.id!}
//           isOpen={true}
//           repliesCount={postToDisplay?.repliesCount!}
//           createdAt={postToDisplay?.createdAt!}
//           text={postToDisplay?.text!}
//           author={postToDisplay?.author!}
//           reposts={postToDisplay?.reposts!}
//         />
//       </div>
//     </div>
//   );
// };

const PostDetailView = ({ postId }: { postId: string }) => {
  return <div>{postId}</div>;
};

export default PostDetailView;
