'use client';

import useBreakpoint from '@/hooks/useBreakpoint';
import { cn } from '@/lib/utils';
import React from 'react';

const Wrapper = ({
  children,
  isSmall = false,
}: {
  children: React.ReactNode;
  isSmall?: boolean;
}) => {
  const { isMobile } = useBreakpoint();
  return (
    <main className='flex justify-center h-screen'>
      <section className='w-full'>
        <div
          className={cn(
            'w-full md:max-w-6xl mx-auto relative',
            isSmall ? 'md:max-w-[600px]' : 'mt-4 md:max-w-6xl',
          )}
        >
          <div
            className={cn(
              isSmall && 'min-h-screen',
              !isMobile &&
                isSmall &&
                'bg-gray-6 border-gray-5 shadow-lg rounded-tl-[25px] rounded-tr-[25px]',
            )}
          >
            {children}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Wrapper;
