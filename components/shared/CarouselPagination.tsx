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
    <div
      className='absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-[100] pointer-events-auto'
      onClick={(e) => e.stopPropagation()}
    >
      {Array.from({ length: totalCount }).map((_, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          className={cn(
            'rounded-full transition-all duration-300 shadow-sm',
            'size-2',
            selectedIndex === index
              ? 'bg-white/90'
              : 'bg-white/40 hover:bg-white/80'
          )}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default CarouselPagination;
