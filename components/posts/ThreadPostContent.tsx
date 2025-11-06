// 'use client';

// import useMediaControls from '@/hooks/useMediaControls';
// import { AspectRatio, ThreadPostContentProps } from '@/lib/types';
// import { cn } from '@/lib/utils';
// import Image from 'next/image';
// import MediaControls from '../shared/MediaControls';
// import PostText from '../shared/PostText';
// import PostFooter from './PostFooter';
// import LinkPreviewCard from '../cards/LinkPreviewCard';
// import PostVideoCard from '../cards/PostVideoCard';

// const ThreadPostContent: React.FC<ThreadPostContentProps> = ({
//   media,
//   author,
//   createdAt,
//   postId,
//   threadText,
//   linkPreview,
//   pinned,
//   mentions,
//   reposts,
//   repostedBy,
//   hideLikes,
//   turnOffComments,
// }) => {
//   const hasMedia = media && media.length > 0;
//   const isImageOrGif =
//     hasMedia && (media[0].fileType === 'image' || media[0].fileType === 'gif');
//   const isVideo = hasMedia && media[0].fileType === 'video';

//   const {
//     showControls,
//     setShowControls,
//     controlsTimeoutRef,
//     showControlsTemporarily,
//   } = useMediaControls();

//   return (
//     <div
//       className='post-container'
//       onMouseEnter={() => setShowControls(true)}
//       onMouseLeave={() => {
//         setShowControls(false);
//       }}
//       onTouchStart={showControlsTemporarily}
//       onTouchMove={() => {
//         if (controlsTimeoutRef.current) {
//           clearTimeout(controlsTimeoutRef.current);
//         }
//       }}
//     >
//       <div className='post-container-fitted'>
//         <div className='px-3 py-4 w-full flex flex-col bg-black/75 max-h-[74vh] min-h-[15vh] gap-4'>
//           <div
//             className={cn(
//               'overflow-y-auto scrollbar-thumb-rounded-full scrollbar-track-rounded-full',
//               'scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent'
//             )}
//           >
//             <PostText
//               text={threadText!}
//               mentions={mentions}
//               className='text-base leading-relaxed pr-2'
//               isThreadPost
//             />
//           </div>

//           {isImageOrGif && (
//             <div className='flex-shrink-0'>
//               <div className='relative overflow-hidden'>
//                 {media[0].fileType === 'gif' ? (
//                   <img
//                     src={media[0].fileUrl}
//                     alt='Thread Media'
//                     className='object-contain rounded-lg'
//                     width={200}
//                     height={200}
//                     loading='lazy'
//                   />
//                 ) : media[0].fileType === 'image' ? (
//                   <Image
//                     src={media[0].fileUrl}
//                     alt='Thread Media'
//                     className='object-contain rounded-lg'
//                     width={200}
//                     height={200}
//                     priority={false}
//                   />
//                 ) : null}
//               </div>
//             </div>
//           )}
//           {isVideo && (
//             <div
//               className={cn(
//                 'relative w-fit max-w-full flex-shrink-0 overflow-hidden',
//                 media?.[0].aspectRatio === ('16/9' as AspectRatio)
//                   ? 'h-[250px]'
//                   : 'h-[325px]'
//               )}
//             >
//               <PostVideoCard
//                 video={media[0].fileUrl}
//                 poster={media[0].thumbnailUrl!}
//                 postId={postId}
//                 author={author}
//                 createdAt={createdAt}
//                 mentions={mentions}
//                 text={threadText}
//                 reposts={reposts}
//                 repostedBy={repostedBy}
//                 aspectRatio={media[0].aspectRatio}
//                 showControls={showControls}
//                 isThreadView
//               />
//             </div>
//           )}
//           {linkPreview && <LinkPreviewCard {...linkPreview} />}
//         </div>
//       </div>
//       <MediaControls
//         author={author}
//         postId={postId}
//         createdAt={createdAt}
//         threadText={threadText}
//         showControls={showControls}
//         pinned={pinned}
//         hideLikes={hideLikes}
//         turnOffComments={turnOffComments}
//       />
//       <PostFooter
//         author={author}
//         createdAt={createdAt}
//         id={postId}
//         reposts={reposts}
//         repostedBy={repostedBy}
//         isThread
//       />
//     </div>
//   );
// };

// export default ThreadPostContent;
