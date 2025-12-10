'use client';

import { Button } from '@/components/ui/button';
import { CarouselNavigationProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Fragment } from 'react';

const CarouselNavigation = ({
  selectedIndex,
  totalCount,
  onPrev,
  onNext,
  className,
}: CarouselNavigationProps) => {
  if (totalCount <= 1) return null;

  return (
    <Fragment>
      {selectedIndex > 0 && (
        <Button
          variant='ghost'
          size='icon'
          className={cn('carousel-btn', 'left-4', className)}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onPrev();
          }}
          disabled={selectedIndex === 0}
        >
          <ChevronLeft className='size-6' />
        </Button>
      )}

      {selectedIndex < totalCount - 1 && (
        <Button
          variant='ghost'
          size='icon'
          className={cn('carousel-btn', 'right-4', className)}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNext();
          }}
          disabled={selectedIndex === totalCount - 1}
        >
          <ChevronRight className='size-6' />
        </Button>
      )}
    </Fragment>
  );
};

export default CarouselNavigation;
