import useToggleHidePost from '@/hooks/useToggleHidePost';
import { cn } from '@/lib/utils';
import { UndoIcon } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';

const HiddenPost: React.FC<{ postId: string; isFullHeight?: boolean }> = ({
  postId,
  isFullHeight,
}) => {
  const { toggleHide } = useToggleHidePost({
    postId,
  });

  return (
    <div
      className={cn(
        'w-full flex-center',
        isFullHeight
          ? '-ml-14 max-w-[calc((0px-2rem+100vh)*0.5625)] h-[calc(0px-2rem+100vh)] relative snap-center snap-always'
          : 'h-full',
      )}
    >
      <div
        className={cn(
          'relative h-full w-full overflow-hidden flex-center cursor-pointer bg-gray-6',
          isFullHeight && 'rounded-2xl',
        )}
      >
        <div className='flex-col-center gap-3 text-center p-6'>
          <h3 className='text-xl font-medium text-neutral-100'>
            This post has been hidden
          </h3>
          <p className='text-base text-neutral-400 mb-2'>
            You won't see this post in your feed anymore
          </p>
          <Button
            variant='outline'
            size='sm'
            className='rounded-full border-neutral-700 text-neutral-100 hover:bg-neutral-700/10 hover:text-neutral-100 gap-2'
            onClick={toggleHide}
          >
            <UndoIcon className='size-4' />
            <span>Undo</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HiddenPost;
