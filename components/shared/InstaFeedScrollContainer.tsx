'use client';

import { forwardRef } from 'react';
import NewCollection from '../modals/NewCollection';

const InstaFeedScrollContainer = forwardRef<
  HTMLDivElement,
  { children: React.ReactNode }
>(({ children }, ref) => (
  <main className='flex justify-center w-full min-h-screen hide-scrollbar'>
    <div className='w-full max-w-[470px]'>
      <div ref={ref} className='relative w-full pb-10'>
        {children}
        <NewCollection />
      </div>
    </div>
  </main>
));

InstaFeedScrollContainer.displayName = 'InstaFeedScrollContainer';
export default InstaFeedScrollContainer;
