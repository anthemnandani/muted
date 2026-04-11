import ThreadCard from '@/components/cards/ThreadCard';
import type { ThreadProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useActivityStore } from '@/store/activityStore';
import { Check } from 'lucide-react';

const ThreadListItem = ({ thread }: { thread: ThreadProps }) => {
  const { isSelecting, selectedIds, toggleSelect } = useActivityStore();
  const isSelected = selectedIds.has(thread.id);

  const handleClick = (e: React.MouseEvent) => {
    if (isSelecting) {
      e.preventDefault();
      e.stopPropagation();
      toggleSelect(thread.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-start gap-3 transition-all duration-200',
        isSelecting && 'cursor-pointer',
      )}
    >
      {isSelecting && (
        <div
          className='flex-shrink-0 pt-6 pl-2 cursor-pointer'
          onClick={(e) => {
            e.stopPropagation();
            toggleSelect(thread.id);
          }}
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

      <div
        className={cn(
          'flex-1 min-w-0 transition-all duration-200 rounded-[25px]',
          isSelecting && 'pointer-events-none opacity-90',
        )}
      >
        <ThreadCard {...thread} isSeparate disableTracking />
      </div>
    </div>
  );
};

export default ThreadListItem;
