import useLike from '@/hooks/useLike';
import { useThreadRepost } from '@/hooks/useThreadRepost';
import { Comment, ThreadCommentContentProps } from '@/lib/types';
import { cn, formatCount, formatTimeAgo } from '@/lib/utils';
import useAddCommentStore from '@/store/addComment';
import { Heart, Repeat2 } from 'lucide-react';
import Link from 'next/link';
import CommentActions from '../comments/CommentActions';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Username from '../user/Username';
import ThreadText from './ThreadText';

const ThreadCommentContent = ({
  comment,
  threadAuthorId,
  onEditClick,
  isReply,
}: ThreadCommentContentProps) => {
  const {
    id,
    author,
    text,
    likesCount,
    createdAt,
    likes,
    mentions,
    reposts,
    repostsCount,
  } = comment;

  const {
    isLikedByMe,
    likesCount: updatedLikesCount,
    toggleLike,
  } = useLike({
    initialLikesCount: likesCount,
    likes,
    id,
    type: 'THREAD',
  });

  const {
    isRepostedByMe,
    repostsCount: mainRepostsCount,
    toggleRepost,
  } = useThreadRepost({
    reposts,
    initialRepostsCount: repostsCount!,
    threadId: id,
  });

  const { startReplying } = useAddCommentStore();

  const handleReplyClick = () => {
    if (isReply) {
      startReplying(id, author.username);
    } else {
      startReplying(id);
    }
  };

  return (
    <div className='flex items-start gap-3 group relative'>
      <Link href={`/@${author.username}`} className='flex-shrink-0 pt-1'>
        <Avatar className='rounded-full size-8'>
          <AvatarImage
            src={author.image ?? ''}
            alt={author.username ?? ''}
            className='object-cover'
          />
          <AvatarFallback>
            {author.username?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2 mb-0.5'>
          <Username
            author={author}
            className='truncate text-[14px] font-semibold leading-none'
            postAuthorId={threadAuthorId}
            isComment
          />
          <span className='text-white/50 inline-block align-middle'>
            &middot;
          </span>
          <span className='text-[12px] text-white/50 leading-none'>
            {formatTimeAgo(createdAt)}
          </span>
        </div>

        <ThreadText text={text!} mentions={mentions} isComment />
        <div className='flex items-center mt-2.5 gap-6'>
          <button
            onClick={toggleLike}
            className='flex items-center gap-1.5 group/like'
          >
            <Heart
              fill={isLikedByMe ? '#ff3040' : 'transparent'}
              className={cn(
                'size-[15px] text-gray-400 transition-colors group-hover/like:text-primary-red',
                {
                  'text-primary-red': isLikedByMe,
                },
              )}
            />
            {updatedLikesCount > 0 && (
              <span
                className={cn(
                  'text-[12px] text-gray-400 group-hover/like:text-primary-red',
                  isLikedByMe && 'text-primary-red',
                )}
              >
                {formatCount(updatedLikesCount)}
              </span>
            )}
          </button>

          <button
            className='flex items-center gap-1.5 group/repost'
            onClick={toggleRepost}
          >
            <Repeat2
              className={cn(
                'size-4 text-gray-400 transition-colors group-hover/repost:text-primary-blue',
                {
                  'text-primary-blue': isRepostedByMe,
                },
              )}
            />
            {mainRepostsCount > 0 && (
              <span
                className={cn(
                  'text-[12px] text-gray-400 group-hover/repost:text-primary-blue',
                  isRepostedByMe && 'text-primary-blue',
                )}
              >
                {formatCount(mainRepostsCount)}
              </span>
            )}
          </button>

          <button
            className='text-gray-100 text-sm hover:text-gray-200'
            onClick={handleReplyClick}
          >
            Reply
          </button>
        </div>
      </div>

      <CommentActions
        authorId={author.id}
        postAuthorId={threadAuthorId}
        postId={id}
        createdAt={createdAt}
        text={text ?? ''}
        type='THREAD'
        isReply={isReply}
        onEditClick={onEditClick}
      />
    </div>
  );
};

export default ThreadCommentContent;
