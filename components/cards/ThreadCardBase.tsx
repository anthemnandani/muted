// 'use client';

// import type { PostCardProps } from '@/lib/types';
// import { cn } from '@/lib/utils';
// import { useHiddenPosts } from '@/store/hiddenPosts';
// import { useMutedUsers } from '@/store/mutedUsers';
// import { useRouter } from 'next/navigation';
// import React from 'react';
// import PostHeader from '../posts/PostHeader';
// import PostActions from '../shared/PostActions';
// import ThreadContent from '../shared/ThreadContent';
// import RepostedBy from '../user/RepostedBy';
// import HiddenPost from './HiddenPost';
// import LinkPreviewCard from './LinkPreviewCard';
// import MutedPost from './MutedPost';
// import ThreadQuoteCard from './ThreadQuoteCard';

// interface ThreadCardBaseProps extends PostCardProps {
//   variant?: 'default' | 'reply';
//   showHeader?: boolean;
//   showActions?: boolean;
//   className?: string;
//   children?: React.ReactNode;
// }

// const ThreadCardBase: React.FC<ThreadCardBaseProps> = ({
//   id,
//   text,
//   createdAt,
//   author,
//   media,
//   quoteId,
//   repostedBy,
//   repostedAt,
//   mentions,
//   likes,
//   likesCount,
//   reposts,
//   repostsCount,
//   bookmarks,
//   bookmarksCount,
//   repliesCount,
//   hideLikes,
//   privacy,
//   linkPreview,
//   showMuted = true,
//   variant = 'default',
//   showHeader = true,
//   showActions = true,
//   className,
//   children,
// }) => {
//   const { isTemporarilyHidden } = useHiddenPosts();
//   const { isMutedUser } = useMutedUsers();
//   const router = useRouter();

//   const handleContentClick = (e: React.MouseEvent) => {
//     const target = e.target as HTMLElement;
//     if (
//       target.closest('.vjs-control-bar') ||
//       target.closest('.vjs-big-play-button') ||
//       target.tagName === 'VIDEO'
//     ) {
//       e.preventDefault();
//       e.stopPropagation();
//       return;
//     }
//     router.push(`/${author.username}/post/${id}`);
//   };

//   const content = (
//     <>
//       <ThreadContent
//         id={id}
//         text={text}
//         mentions={mentions}
//         media={media}
//         author={author}
//         variant={variant}
//       />
//       {quoteId && (
//         <div className='px-10'>
//           <ThreadQuoteCard quoteId={quoteId} />
//         </div>
//       )}
//     </>
//   );

//   if (isMutedUser(author.id) && showMuted) {
//     return (
//       <MutedPost
//         message={`Posts from ${author.username} are muted.`}
//         userId={author.id}
//       />
//     );
//   }

//   if (isTemporarilyHidden(id)) {
//     return (
//       <HiddenPost
//         message={`This ${
//           variant === 'reply' ? 'reply' : 'post'
//         } has been hidden.`}
//         postId={id}
//       />
//     );
//   }

//   return (
//     <div className={cn('mb-3', className)}>
//       {repostedBy && (
//         <RepostedBy repostedBy={repostedBy} repostedAt={repostedAt} />
//       )}

//       {showHeader && (
//         <PostHeader
//           author={author}
//           createdAt={createdAt}
//           id={id}
//           currentText={text ?? ''}
//           variant={variant}
//           hideLikes={hideLikes}
//         />
//       )}

//       {variant === 'default' ? (
//         <div className='w-full cursor-pointer' onClick={handleContentClick}>
//           {content}
//         </div>
//       ) : (
//         content
//       )}

//       {linkPreview && (
//         <div className='mx-2 md:mx-4 my-2'>
//           <a href={linkPreview.url} target='_blank' rel='noreferrer'>
//             <LinkPreviewCard
//               url={linkPreview.url}
//               title={linkPreview.title}
//               description={linkPreview.description}
//               image={linkPreview.image}
//             />
//           </a>
//         </div>
//       )}

//       {showActions && (
//         <div className='pt-2 flex-between w-full px-2 md:px-4'>
//           <PostActions
//             id={id}
//             likesCount={likesCount ?? 0}
//             likes={likes}
//             text={text}
//             author={author}
//             createdAt={createdAt}
//             repliesCount={repliesCount ?? 0}
//             repostsCount={repostsCount ?? 0}
//             reposts={reposts}
//             media={media}
//             linkPreview={linkPreview}
//             mentions={mentions}
//             hideLikes={hideLikes}
//             bookmarksCount={bookmarksCount ?? 0}
//             bookmarks={bookmarks}
//             privacy={privacy}
//           />
//         </div>
//       )}

//       {children}
//     </div>
//   );
// };

// export default ThreadCardBase;
