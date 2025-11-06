// 'use client';

// import { Icons } from '@/components/icons';
// import { Card } from '@/components/ui/card';
// import type { ParentPostInfo } from '@/lib/types';
// import { formatTimeAgo } from '@/lib/utils';
// import { api } from '@/trpc/react';
// import Link from 'next/link';
// import React from 'react';
// import ThreadContent from '../shared/ThreadContent';
// import UserAvatar from '../shared/UserAvatar';
// import Username from '../user/Username';
// import LinkPreviewCard from './LinkPreviewCard';

// type ThreadQuoteCardProps = Partial<ParentPostInfo> & { quoteId?: string };

// const ThreadQuoteCard: React.FC<ThreadQuoteCardProps> = ({
//   author,
//   text,
//   quoteId,
//   media,
//   mentions,
//   createdAt,
//   linkPreview,
// }) => {
//   if (quoteId) {
//     const { data, isLoading } = api.post.getQuotedPost.useQuery(
//       { id: quoteId },
//       {
//         enabled: !!quoteId,
//         staleTime: Infinity,
//       }
//     );
//     if (isLoading) {
//       return (
//         <div className='h-[100px] w-full flex-center'>
//           <Icons.loading className='size-11' />
//         </div>
//       );
//     }

//     if (!data) return <div>Not found</div>;

//     return (
//       <Link
//         href={`/@${data.postInfo.user.username}/post/${data.postInfo.id}`}
//         className='w-full'
//       >
//         <RenderCard
//           id={data.postInfo.id}
//           author={data?.postInfo.user}
//           text={data?.postInfo.text}
//           media={data?.postInfo.media}
//           createdAt={data.postInfo.createdAt}
//           mentions={data.postInfo.mentions}
//           linkPreview={data.postInfo.linkPreview}
//         />
//       </Link>
//     );
//   }

//   return (
//     <RenderCard
//       author={author}
//       text={text}
//       createdAt={createdAt}
//       media={media}
//       mentions={mentions}
//       linkPreview={linkPreview}
//     />
//   );
// };

// export default ThreadQuoteCard;

// const RenderCard: React.FC<ThreadQuoteCardProps> = ({
//   id,
//   author,
//   text,
//   media,
//   createdAt,
//   mentions,
//   linkPreview,
// }) => {
//   return (
//     <Card className='overflow-hidden p-4 mt-3 mb-2 rounded-xl bg-transparent border-border w-full'>
//       <div className='flex-between mb-1.5'>
//         <div className='flex items-center gap-2'>
//           <UserAvatar
//             fullname={author?.fullName}
//             image={author?.image}
//             username={author?.username ?? ''}
//             className='size-7'
//           />
//           <Username author={author!} />
//           <time className='text-[15px] text-gray-3 cursor-default'>
//             {createdAt && formatTimeAgo(createdAt)}
//           </time>
//         </div>
//       </div>

//       <ThreadContent id={id} text={text} media={media} mentions={mentions} />

//       {linkPreview && (
//         <div className='mx-2 my-2'>
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
//     </Card>
//   );
// };
