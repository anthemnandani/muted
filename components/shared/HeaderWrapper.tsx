'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const HeaderWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const changeBgColor = () => {
      window.scrollY > 0 ? setIsScrolled(true) : setIsScrolled(false);
    };
    window.addEventListener('scroll', changeBgColor);
    return () => window.removeEventListener('scroll', changeBgColor);
  }, [isScrolled]);

  return (
    <div
      className={cn(
        'sticky top-0 z-10 w-full',
        isScrolled ? 'bg-[#101010D9] backdrop-blur-2xl' : 'bg-transparent'
      )}
    >
      {children}
    </div>
  );
};

export default HeaderWrapper;
