'use client';

import { cn } from '@/lib/utils';
import { Icons } from '../icons';
import usePostNavigator from '@/hooks/usePostNavigator';

const PostNavigator = () => {
  const { isFirstPost, isLastPost, currentIndex } = usePostNavigator();

  const handleNavigation = (direction: 'up' | 'down') => {
    const targetElement = document.querySelector(
      `[data-post-index="${
        direction === 'up' ? currentIndex - 1 : currentIndex + 1
      }"]`
    );

    targetElement?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  return (
    <div className='fixed right-4 top-1/2 -translate-y-1/2 flex flex-col justify-center gap-4 w-fit'>
      <button
        className={cn(
          'navigator-btn',
          isFirstPost && 'cursor-not-allowed opacity-40'
        )}
        disabled={isFirstPost}
        onClick={() => handleNavigation('up')}
      >
        <Icons.chevronUp className='size-6 text-white/90 font-medium' />
      </button>
      <button
        className={cn(
          'navigator-btn',
          isLastPost && 'cursor-not-allowed opacity-40'
        )}
        disabled={isLastPost}
        onClick={() => handleNavigation('down')}
      >
        <Icons.chevronDown className='size-6 text-white/90 font-medium' />
      </button>
    </div>
  );
};

export default PostNavigator;
