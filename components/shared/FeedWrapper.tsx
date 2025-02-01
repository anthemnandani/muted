'use client';

import Loading from '@/app/(pages)/loading';
import Error from '@/app/error';
import ThreadsList from '@/components/shared/ThreadsList';
import { ParentPostProps, ThreadFilter } from '@/lib/types';
import React from 'react';

interface FeedWrapperProps {
  posts?: ParentPostProps[];
  isLoading: boolean;
  isError: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: any;
  selectedFilter?: ThreadFilter;
  emptyStateMessage: string | React.ReactNode;
}

const FeedWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className='h-[90vh] overflow-y-scroll hide-scrollbar snap-y snap-mandatory'>
      {children}
    </div>
  );
};

export default FeedWrapper;
