'use client';

import { forwardRef } from 'react';

const HomeFeedScrollContainer = forwardRef<
  HTMLDivElement,
  { children: React.ReactNode }
>(({ children }, ref) => (
  <main className='flex justify-center w-full min-h-screen hide-scrollbar'>
    <div className='w-full max-w-[470px]'>
      <div ref={ref} className='relative w-full pb-10'>
        {children}
      </div>
    </div>
  </main>
));

HomeFeedScrollContainer.displayName = 'HomeFeedScrollContainer';
export default HomeFeedScrollContainer;
