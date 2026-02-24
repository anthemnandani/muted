'use client';

import { CarouselPaginationProps } from '@/lib/types';
import { cn } from '@/lib/utils';

const CarouselPagination = ({
  selectedIndex,
  totalCount,
  onSelect,
}: CarouselPaginationProps) => {
  if (totalCount <= 1) return null;

  return (
    <div className='cursor-pointer rounded-full px-1.5 h-5 bg-black/20 backdrop-blur-sm transition-opacity flex-center gap-px border border-white/10 shadow-sm'>
      {Array.from({ length: totalCount }).map((_, index) => (
        <button
          key={index}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect(index);
          }}
          className='relative inline-block size-3 rounded-full hover:bg-neutral-3'
          aria-label={`Go to slide ${index + 1}`}
        >
          <div
            className={cn(
              'absolute size-[6px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
              index === selectedIndex ? 'bg-neutral' : 'bg-neutral-2',
            )}
          />
        </button>
      ))}
    </div>
  );
};

export default CarouselPagination;
