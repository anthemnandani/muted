'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import useBreakpoint from '@/hooks/useBreakpoint';


interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

const BottomSheet = ({
  open,
  onOpenChange,
  children,
  className,
}: BottomSheetProps) => {
  const startYRef = useRef<number | null>(null);
  const dragYRef = useRef(0);
  const [, forceUpdate] = useState(0);

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { isMobile } = useBreakpoint();

  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0]!.clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startYRef.current === null) return;
    const delta = e.touches[0]!.clientY - startYRef.current;
    if (delta > 0) {
      dragYRef.current = delta;
      requestAnimationFrame(() => forceUpdate(v => v + 1));
    }
  };

  const handleTouchEnd = () => {
    if (dragYRef.current > 100) onOpenChange(false);
    dragYRef.current = 0;
    forceUpdate(v => v + 1);
    startYRef.current = null;
  };

  useEffect(() => {
    if (!isMobile) return;

    const initialHeight = window.innerHeight;

    let resizeTimeout: any;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const currentHeight = window.innerHeight;
        const heightDiff = initialHeight - currentHeight;

        if (heightDiff > 150) {
          setKeyboardHeight(heightDiff);
        } else {
          setKeyboardHeight(0);
        }
      }, 50);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 z-40 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 will-change-transform duration-200' />
        <Dialog.Content
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50 flex flex-col',
            'rounded-t-2xl bg-[#121212] shadow-xl pb-safe-bottom',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
            'will-change-transform duration-200',
            className,
          )}
          style={{
            transform:
              dragYRef.current > 0
                ? `translate3d(0, ${dragYRef.current}px, 0)`
                : 'translate3d(0,0,0)',
            willChange: 'transform',
            transition:
              dragYRef.current > 0
                ? 'none'
                : 'transform 0.2s ease-out, padding-bottom 0.25s ease',
            height: isMobile
              ? `calc(100dvh - ${keyboardHeight}px)`
              : '80vh',
            paddingBottom: 0,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Drag handle */}
          <div className='flex-shrink-0 flex items-center justify-center pt-3 pb-1'>
            <div className='w-10 h-1 rounded-full bg-white/30' />
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default BottomSheet;
