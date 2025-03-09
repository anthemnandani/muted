'use client';

import usePostNavigator from '@/hooks/usePostNavigator';
import NavigationButtons from '../buttons/NavigationButtons';

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
    <NavigationButtons
      isFirstPost={isFirstPost}
      isLastPost={isLastPost}
      handleNavigation={handleNavigation}
    />
  );
};

export default PostNavigator;
