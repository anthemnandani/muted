import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ActivityComment } from '@/lib/types';
import { cn, formatTimeAgo } from '@/lib/utils';
import { useActivityStore } from '@/store/activityStore';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ActivityCommentRow = ({ comment }: { comment: ActivityComment }) => {
  const { id, parentPost, replyToComment, author } = comment;
  const { isSelecting, selectedIds, toggleSelect } = useActivityStore();
  const isSelected = selectedIds.has(id);
  const router = useRouter();

  if (!parentPost) return null;

  const isNestedReply = !!replyToComment;

  const postDescription = parentPost.text
    ? parentPost.text.length > 150
      ? parentPost.text.slice(0, 150) + '...'
      : parentPost.text
    : null;

  const parentCommentText = replyToComment?.text
    ? replyToComment.text.length > 120
      ? replyToComment.text.slice(0, 120) + '...'
      : replyToComment.text
    : null;

  const mediaItem = parentPost.media?.[0];
  const thumbnailSrc =
    mediaItem?.fileType === 'VIDEO'
      ? mediaItem.thumbnailUrl
      : mediaItem?.fileUrl;

  const handleClick = () => {
    if (isSelecting) {
      toggleSelect?.(id);
      return;
    }
    router.push(`/post/${parentPost.id}`);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSelect?.(id);
  };

  return (
    <div
      role='link'
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className={cn(
        'flex items-start gap-3 py-4 px-3 border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors cursor-pointer',
        isSelecting && isSelected && 'bg-white/[0.04]',
      )}
    >
      {isSelecting && (
        <div
          className='flex-shrink-0 pt-1 cursor-pointer'
          onClick={handleSelect}
        >
          <div
            className={cn(
              'size-6 rounded-full border-2 flex items-center justify-center transition-all',
              isSelected
                ? 'bg-white border-white'
                : 'bg-black/40 border-white/60 hover:border-white',
            )}
          >
            {isSelected && (
              <Check className='size-3.5 text-black' strokeWidth={3} />
            )}
          </div>
        </div>
      )}

      <div className='flex-1 min-w-0'>
        <div className='flex items-start gap-2.5'>
          <Avatar className='size-8 rounded-full flex-shrink-0'>
            <AvatarImage
              src={parentPost.author.image ?? ''}
              alt={parentPost.author.username ?? ''}
              className='object-cover'
            />
            <AvatarFallback className='text-xs bg-white/10 text-white/60'>
              {parentPost.author.username?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0'>
            <p className='text-sm text-white leading-snug'>
              <span className='font-semibold'>
                {parentPost.author.username}
              </span>
              {postDescription && (
                <span className='text-white/80 ml-1'>{postDescription}</span>
              )}
            </p>
            <span className='text-white/40 text-xs'>
              {formatTimeAgo(parentPost.createdAt)}
            </span>
          </div>
        </div>

        {isNestedReply && replyToComment && (
          <div className='flex items-start gap-2.5 mt-2 ml-10'>
            <Avatar className='size-7 rounded-full flex-shrink-0'>
              <AvatarImage
                src={replyToComment.author.image ?? ''}
                alt={replyToComment.author.username ?? ''}
                className='object-cover'
              />
              <AvatarFallback className='text-[10px] bg-white/10 text-white/60'>
                {replyToComment.author.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0'>
              <p className='text-sm text-white/70 leading-snug'>
                <span className='font-semibold text-white/80'>
                  {replyToComment.author.username}
                </span>
                {parentCommentText && (
                  <span className='ml-1'>{parentCommentText}</span>
                )}
              </p>
              <span className='text-white/30 text-xs'>
                {formatTimeAgo(replyToComment.createdAt)}
              </span>
            </div>
          </div>
        )}

        <div className='flex items-start gap-2.5 mt-2 ml-10'>
          <Avatar className='size-8 rounded-full flex-shrink-0'>
            <AvatarImage
              src={author.image ?? ''}
              alt={author.username ?? ''}
              className='object-cover'
            />
            <AvatarFallback className='text-xs bg-white/10 text-white/60'>
              {author.username?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0'>
            <p className='text-sm text-white leading-snug'>
              <span className='font-semibold'>{author.username}</span>
              {isNestedReply && replyToComment?.author?.username && (
                <span className='text-primary-blue ml-1'>
                  @{replyToComment.author.username}
                </span>
              )}
              {comment.text && (
                <span className='text-white/80 ml-1'>{comment.text}</span>
              )}
            </p>
            <span className='text-white/40 text-xs'>
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {thumbnailSrc && !isSelecting && (
        <div className='size-14 flex-shrink-0 rounded-sm overflow-hidden bg-white/10'>
          <img
            src={thumbnailSrc}
            alt=''
            className='w-full h-full object-cover'
          />
        </div>
      )}
    </div>
  );
};

export default ActivityCommentRow;
