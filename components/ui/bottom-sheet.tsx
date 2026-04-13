'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { useRef, useState } from 'react';

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
  const [dragY, setDragY] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0]!.clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startYRef.current === null) return;
    const delta = e.touches[0]!.clientY - startYRef.current;
    if (delta > 0) setDragY(delta);
  };

  const handleTouchEnd = () => {
    if (dragY > 100) onOpenChange(false);
    setDragY(0);
    startYRef.current = null;
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 z-40 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-300' />
        <Dialog.Content
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50 flex flex-col',
            'h-[80vh] rounded-t-2xl bg-[#121212] shadow-xl pb-safe-bottom',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
            'duration-300',
            className,
          )}
          style={{
            transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
            transition: dragY > 0 ? 'none' : undefined,
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
