import useToggleHidePost from '@/hooks/useToggleHidePost';
import { Button } from '../ui/button';
import { UndoIcon } from 'lucide-react';
import React from 'react';

const HiddenPost: React.FC<{ postId: string }> = ({ postId }) => {
  const { handleToggleHidePost, isLoading } = useToggleHidePost({
    postId,
  });

  const toggleHidePost = () => {
    handleToggleHidePost({ postId });
  };

  return (
    <div className='-ml-14 w-full max-w-[calc((0px-2rem+100vh)*0.5625)] h-[calc(0px-2rem+100vh)] flex-center relative snap-center snap-always'>
      <div className='relative h-full w-full overflow-hidden flex-center cursor-pointer bg-black rounded-2xl'>
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
            onClick={toggleHidePost}
            disabled={isLoading}
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
