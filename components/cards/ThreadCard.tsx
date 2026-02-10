'use client';

import type { ThreadProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import React from 'react';
import { Separator } from '../ui/separator';
import ThreadCardBase from './ThreadCardBase';

interface ThreadCardProps extends ThreadProps {
  isLastThread?: boolean;
  showUsername?: boolean;
}

const ThreadCard: React.FC<ThreadCardProps> = ({
  isLastThread,
  showUsername,
  ...props
}) => {
  return (
    <article className={cn('w-full pt-4', isLastThread && 'mb-20 md:mb-10')}>
      <ThreadCardBase {...props} />
      {!isLastThread && !showUsername && <Separator />}
    </article>
  );
};

export default ThreadCard;
