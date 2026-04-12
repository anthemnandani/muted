import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import type { ContentTableProps, TopPost, TopThread } from '@/lib/types';
import { cn, formatCount, getImageUrl } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { BarChart2, Heart, Inbox, MessageCircle } from 'lucide-react';
import Link from 'next/link';

const ContentTable = ({ items, type, isLoading }: ContentTableProps) => {
  const gridLayout =
    type === 'post'
      ? 'grid-cols-[52px_1fr_72px_72px_72px]'
      : 'grid-cols-[1fr_72px_72px_72px]';

  if (isLoading) {
    return (
      <div className='space-y-1'>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className='flex items-center gap-4 py-3 px-2'>
            {type === 'post' && (
              <Skeleton className='size-12 rounded-xl bg-white/5 flex-shrink-0' />
            )}
            <div className='flex-1'>
              <Skeleton className='h-3.5 w-3/4 bg-white/5 mb-2.5' />
              <Skeleton className='h-2.5 w-24 bg-white/[0.03]' />
            </div>
            <div className='hidden sm:flex sm:gap-6'>
              <Skeleton className='h-4 w-12 bg-white/[0.03]' />
              <Skeleton className='h-4 w-12 bg-white/[0.03]' />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className='flex-col-center py-12 px-4 border border-dashed border-white/[0.05] rounded-xl bg-white/[0.01]'>
        <div className='size-10 rounded-full bg-white/[0.03] flex-center mb-3'>
          <Inbox className='size-5 text-white/30' />
        </div>
        <p className='text-white/60 text-sm font-medium'>No {type}s found</p>
        <p className='text-white/30 text-xs mt-1 text-center'>
          Try selecting a different time range
        </p>
      </div>
    );
  }

  return (
    <div className='overflow-x-auto pb-2'>
      <div className='min-w-[480px] grid grid-cols-[52px_1fr_72px_72px_72px] gap-3 px-2 pb-3'>
        <span />
        <span className='text-xs text-white/30 font-semibold uppercase tracking-wider'>
          Content
        </span>
        <div className='flex items-center justify-end gap-1.5 text-xs text-white/30 font-semibold uppercase tracking-wider'>
          <BarChart2 className='size-3' /> Views
        </div>
        <div className='flex items-center justify-end gap-1.5 text-xs text-white/30 font-semibold uppercase tracking-wider'>
          <Heart className='size-3' /> Likes
        </div>
        <div className='flex items-center justify-end gap-1.5 text-xs text-white/30 font-semibold uppercase tracking-wider'>
          <MessageCircle className='size-3' /> Comments
        </div>
      </div>

      <Separator className='bg-white/[0.04] mb-1' />

      <div className='min-w-[480px] flex flex-col gap-0.5'>
        {items.map((item) => {
          const href =
            type === 'post' ? `/post/${item.id}` : `/thread/${item.id}`;
          let thumbnailSrc: string | null = null;
          if (type === 'post' && (item as TopPost).media?.[0]) {
            thumbnailSrc = getImageUrl((item as TopPost).media[0]);
          }

          const hasCaption = !!item.text;
          const label = hasCaption
            ? (item as TopThread).text.length > 60
              ? (item as TopThread).text.slice(0, 60) + '…'
              : item.text
            : type === 'post'
              ? 'Photo post'
              : 'Thread';

          return (
            <Link
              key={item.id}
              href={href}
              className={cn(
                'group grid gap-3 items-center py-2.5 px-2 rounded-xl hover:bg-white/[0.04] transition-all duration-200',
                gridLayout,
              )}
            >
              {thumbnailSrc && (
                <div className='size-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/[0.04] ring-1 ring-white/[0.05]'>
                  <img
                    src={thumbnailSrc}
                    alt=''
                    className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className='min-w-0 pr-4'>
                <p
                  className={cn(
                    'text-[13px] truncate leading-snug transition-colors',
                    hasCaption
                      ? 'text-white/90 group-hover:text-white'
                      : 'text-white/40 italic',
                  )}
                >
                  {label}
                </p>
                <p className='text-[11px] text-white/30 mt-1 font-medium'>
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>

              <div className='flex justify-end'>
                <span className='inline-flex items-center justify-end px-2 py-1 rounded-md text-[13px] font-semibold text-white/80 tabular-nums group-hover:bg-white/[0.04] transition-colors'>
                  {formatCount(item.views)}
                </span>
              </div>
              <div className='flex justify-end'>
                <span className='inline-flex items-center justify-end px-2 py-1 rounded-md text-[13px] text-white/50 tabular-nums group-hover:bg-white/[0.04] transition-colors'>
                  {formatCount(item.likes)}
                </span>
              </div>
              <div className='flex justify-end'>
                <span className='inline-flex items-center justify-end px-2 py-1 rounded-md text-[13px] text-white/50 tabular-nums group-hover:bg-white/[0.04] transition-colors'>
                  {formatCount(item.comments)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ContentTable;
