import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ActivityThreadComment } from '@/lib/types';
import { cn, formatTimeAgo } from '@/lib/utils';
import { useActivityStore } from '@/store/activityStore';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ActivityThreadCommentRow = ({
  reply,
}: {
  reply: ActivityThreadComment;
}) => {
  const router = useRouter();
  const { parent, author, id } = reply;
  const { isSelecting, selectedIds, toggleSelect } = useActivityStore();
  const isSelected = selectedIds.has(id);

  const isNestedReply = !!parent?.parent;
  const rootThread = isNestedReply ? parent?.parent : parent;
  const parentReply = isNestedReply ? parent : null;

  const replyToAuthor = parentReply?.author ?? parent?.author;

  const truncate = (text: string | null, max: number) => {
    if (!text) return null;
    return text.length > max ? text.slice(0, max) + '...' : text;
  };

  const handleClick = () => {
    if (isSelecting) {
      toggleSelect?.(id);
      return;
    }
    const targetId = rootThread?.id ?? parent?.id ?? reply.id;
    router.push(`/thread/${targetId}`);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSelect?.(id);
  };

  const mediaItem = rootThread?.media?.[0];
  const thumbnailSrc = mediaItem?.fileUrl;

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
        {rootThread && (
          <div className='flex items-start gap-2.5'>
            <Avatar className='size-8 rounded-full flex-shrink-0'>
              <AvatarImage
                src={rootThread.author.image ?? ''}
                alt={rootThread.author.username ?? ''}
                className='object-cover'
              />
              <AvatarFallback className='text-xs bg-white/10 text-white/60'>
                {rootThread.author.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0'>
              <p className='text-sm text-white leading-snug'>
                <span className='font-semibold'>
                  {rootThread.author.username}
                </span>
                {rootThread.text && (
                  <span className='text-white/80 ml-1'>
                    {truncate(rootThread.text, 150)}
                  </span>
                )}
              </p>
              <span className='text-white/40 text-xs'>
                {formatTimeAgo(rootThread.createdAt)}
              </span>
            </div>
          </div>
        )}

        {parentReply && (
          <div className='flex items-start gap-2.5 mt-2 ml-10'>
            <Avatar className='size-7 rounded-full flex-shrink-0'>
              <AvatarImage
                src={parentReply.author.image ?? ''}
                alt={parentReply.author.username ?? ''}
                className='object-cover'
              />
              <AvatarFallback className='text-[10px] bg-white/10 text-white/60'>
                {parentReply.author.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0'>
              <p className='text-sm text-white/70 leading-snug'>
                <span className='font-semibold text-white/80'>
                  {parentReply.author.username}
                </span>
                {parentReply.text && (
                  <span className='ml-1'>
                    {truncate(parentReply.text, 120)}
                  </span>
                )}
              </p>
              <span className='text-white/30 text-xs'>
                {formatTimeAgo(parentReply.createdAt)}
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
              {isNestedReply && replyToAuthor?.username && (
                <span className='text-primary-blue ml-1'>
                  @{replyToAuthor.username}
                </span>
              )}
              {reply.text && (
                <span className='text-white/80 ml-1'>{reply.text}</span>
              )}
            </p>
            <span className='text-white/40 text-xs'>
              {formatTimeAgo(reply.createdAt)}
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

export default ActivityThreadCommentRow;
