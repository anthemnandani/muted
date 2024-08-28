'use client';
import useWindow from '@/hooks/useWindow';
import { cn } from '@/lib/utils';
import React from 'react';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const { isMobile } = useWindow();
  return (
    <div
      className={cn(
        !isMobile &&
          'dark:bg-gray-6 bg-white border md:dark:border-gray-5 border-gray-1 shadow-lg rounded-tl-[25px] rounded-tr-[25px]'
      )}
    >
      {children}
    </div>
  );
};

export default Wrapper;
