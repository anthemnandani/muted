'use client';

import NewCollection from '@/components/modals/NewCollection';
import { forwardRef } from 'react';

interface ScrollContainerProps {
  children: React.ReactNode;
}

const ScrollContainer = forwardRef<HTMLDivElement, ScrollContainerProps>(
  ({ children }, ref) => {
    return (
      <main className='flex justify-between w-screen max-w-full flex-auto self-center'>
        <div className='content-center min-w-[420px]'>
          <div
            id='main-scroll-container'
            ref={ref}
            className='relative w-full max-h-screen self-center overflow-y-scroll snap-y snap-mandatory smooth-scroll hide-scrollbar'
          >
            {children}
            <NewCollection />
          </div>
        </div>
      </main>
    );
  }
);

ScrollContainer.displayName = 'ScrollContainer';

export default ScrollContainer;
