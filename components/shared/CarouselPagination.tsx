'use client';

import { CarouselPaginationProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Fragment } from 'react';

const CarouselPagination = ({
  selectedIndex,
  totalCount,
  onSelect,
}: CarouselPaginationProps) => {
  if (totalCount <= 1) return null;

  return (
    <div className='flex items-center self-center gap-2'>
      <Button
        variant='ghost'
        size='icon'
        className={cn(
          'size-6 bg-neutral-4 hover:bg-neutral-3 rounded-full disabled:cursor-not-allowed',
          'disabled:opacity-40 text-white/90 text-base flex-center transition-opacity'
        )}
        disabled={selectedIndex === 0}
        onClick={() => onSelect(selectedIndex - 1)}
      >
        <ChevronLeft className='size-4' />
      </Button>

      <div className='cursor-pointer rounded-2xl px-1 h-6 bg-neutral-4 hover:bg-neutral-3 transition-opacity flex-center'>
        {Array.from({ length: totalCount }).map((_, index) => (
          <span
            key={index}
            onClick={() => onSelect(index)}
            className='relative inline-block size-4 rounded-[50%] hover:bg-neutral-3'
            aria-label={`Go to slide ${index + 1}`}
          >
            <div
              className={cn(
                'absolute size-1.5 rounded-[50%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                index === selectedIndex ? 'bg-neutral' : 'bg-neutral-2'
              )}
            />
          </span>
        ))}
      </div>
      <Button
        variant='ghost'
        size='icon'
        className={cn(
          'size-6 bg-neutral-4 hover:bg-neutral-3 rounded-full disabled:cursor-not-allowed',
          'disabled:opacity-40 text-white/90 text-base flex-center transition-opacity'
        )}
        disabled={selectedIndex === totalCount - 1}
        onClick={() => onSelect(selectedIndex + 1)}
      >
        <ChevronRight className='size-4' />
      </Button>
    </div>
  );
};

export default CarouselPagination;
