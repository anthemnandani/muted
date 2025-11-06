// import type { LinkPreview, PostMedia } from '@/lib/types';
// import {
//   formatTimeAgo,
//   highlightTextContent,
//   isGif,
//   isImage,
//   isVideo,
// } from '@/lib/utils';
// import LinkPreviewCard from '../cards/LinkPreviewCard';
// import { Icons } from '../icons';
// import Username from '../user/Username';
// import PostMediaPreview from './PostMediaPreview';

// interface ReplyPreviewProps {
//   text?: string | null;
//   media?: PostMedia[];
//   linkPreview?: LinkPreview | null;
//   author: any;
//   createdAt: Date;
// }

// const ReplyPreview = ({
//   text,
//   media,
//   author,
//   linkPreview,
//   createdAt,
// }: ReplyPreviewProps) => (
//   <>
//     <div className='flex items-center gap-2'>
//       <Username author={author} />
//       <time className='text-[15px] leading-none text-gray-3'>
//         {formatTimeAgo(createdAt)}
//       </time>
//       <div className='size-3 invisible'>
//         <Icons.verified className='size-3' />
//       </div>
//     </div>
//     <div className='flex-grow resize-none overflow-hidden outline-none text-[15px] text-accent-foreground break-words placeholder:text-[#777777] w-full tracking-normal whitespace-pre-line'>
//       <div
//         dangerouslySetInnerHTML={{
//           __html: highlightTextContent(text?.replace(/\\n/g, '\n') || ''),
//         }}
//       />
//     </div>

//     {linkPreview && (
//       <a href={linkPreview.url} target='_blank' rel='noreferrer'>
//         <LinkPreviewCard
//           url={linkPreview.url}
//           title={linkPreview.title}
//           description={linkPreview.description}
//           image={linkPreview.image}
//         />
//       </a>
//     )}

//     {media && isGif(media[0].fileType) && (
//       <PostMediaPreview type='gif' url={media[0].fileUrl} text={text || ''} />
//     )}

//     {media && isImage(media[0].fileType) && (
//       <PostMediaPreview type='image' url={media[0].fileUrl} text={text || ''} />
//     )}

//     {media && isVideo(media[0].fileType) && (
//       <PostMediaPreview type='video' url={media[0].fileUrl} text={text || ''} />
//     )}
//   </>
// );

// export default ReplyPreview;
