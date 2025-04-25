'use client';

import NewCollection from '@/components/modals/NewCollection';
import React, { forwardRef } from 'react';

interface ScrollContainerProps {
  children: React.ReactNode;
}

const ScrollContainer = forwardRef<HTMLDivElement, ScrollContainerProps>(
  ({ children }, ref) => {
    return (
      <main
        id='main-scroll-container'
        ref={ref}
        className='relative h-screen overflow-y-scroll snap-y snap-mandatory smooth-scroll hide-scrollbar'
      >
        <div className='grid place-items-center min-h-screen'>
          <div className='h-full'>{children}</div>
        </div>
        <NewCollection />
      </main>
    );
  }
);

ScrollContainer.displayName = 'ScrollContainer';

export default ScrollContainer;
