// import { UserPostThreadCardProps } from '@/lib/types';
// import usePostStore from '@/store/postStore';
// import { useRouter } from 'next/navigation';
// import PostText from '../shared/PostText';
// import MediaTypeIndicator from './MediaTypeIndicator';

// const UserPostThreadCard = ({
//   threadText,
//   pinned,
//   postId,
//   index,
//   username,
//   mentions,
// }: UserPostThreadCardProps) => {
//   const router = useRouter();
//   const { setCurrentPostId, setCurrentIndex, setProfileUsername, setPostType } =
//     usePostStore();
//   const handlePostClick = () => {
//     setCurrentPostId(postId);
//     setCurrentIndex(index);
//     setProfileUsername(username);
//     setPostType('post');

//     // const postLink = isSearch
//     //   ? `/post/${postId}?q=${query}`
//     //   : `/post/${postId}`;

//     const postLink = `/post/${postId}`;

//     router.push(postLink, { scroll: false });
//   };
//   return (
//     <div
//       className='relative flex-center max-w-[320px] aspect-[3/4] rounded-[4px] overflow-hidden bg-gray-6 cursor-pointer'
//       onClick={handlePostClick}
//     >
//       <div className='h-[95%] w-full overflow-hidden px-3'>
//         <PostText
//           text={threadText!}
//           mentions={mentions}
//           className='text-base leading-relaxed line-clamp-[14]'
//           isThreadPost
//         />
//       </div>
//       {pinned && <MediaTypeIndicator type='pinned' />}
//     </div>
//   );
// };

// export default UserPostThreadCard;
