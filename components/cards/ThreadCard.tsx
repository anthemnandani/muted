'use client';

import type { ThreadProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import React from 'react';
import { Separator } from '../ui/separator';
import ThreadCardBase from './ThreadCardBase';
import { ViewSource } from '@/generated/prisma/enums';

interface ThreadCardProps extends ThreadProps {
  isLastThread?: boolean;
  showUsername?: boolean;
  isSeparate?: boolean;
  disableTracking?: boolean;
}

const ThreadCard: React.FC<ThreadCardProps> = ({
  isLastThread,
  showUsername,
  isSeparate,
  disableTracking,
  ...props
}) => {
  return (
    <article
      className={cn(
        'w-full pt-4',
        isSeparate &&
          'pb-2 px-2 bg-gray-6 border-gray-5 shadow-lg rounded-[25px]',
      )}
    >
      <ThreadCardBase
        {...props}
        source={ViewSource.THREAD_FEED}
        disableTracking={disableTracking}
      />
      {!isSeparate && !isLastThread && <Separator />}
    </article>
  );
};

export default ThreadCard;
