'use client';

import { PostNavigatorContextType } from '@/lib/types';
import React, { createContext, useState } from 'react';

export const PostNavigatorContext = createContext<
  PostNavigatorContextType | undefined
>(undefined);

export function PostNavigatorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isFirstPost, setIsFirstPost] = useState(false);
  const [isLastPost, setIsLastPost] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const setPostNavigation = (index: number, total: number) => {
    setCurrentIndex(index);
    setIsFirstPost(index === 0);
    setIsLastPost(index === total - 1);
  };

  return (
    <PostNavigatorContext.Provider
      value={{
        isFirstPost,
        isLastPost,
        currentIndex,
        setPostNavigation,
      }}
    >
      {children}
    </PostNavigatorContext.Provider>
  );
}
