'use client';

import { Thread } from '@/lib/types';
import { cn } from '@/lib/utils';
import React from 'react';
import { Separator } from '../ui/separator';
import ThreadCardBase from './ThreadCardBase';

interface ThreadCardProps extends Thread {
  isLastThread?: boolean;
  showUsername?: boolean;
  variant?: 'default' | 'reply';
}

const ThreadCard: React.FC<ThreadCardProps> = ({
  isLastThread,
  showUsername,
  variant = 'default',
  ...props
}) => {
  return (
    <article className={cn('w-full pt-4', isLastThread && 'mb-20 md:mb-10')}>
      <ThreadCardBase {...props} variant={variant} />
      {!isLastThread && !showUsername && <Separator />}
    </article>
  );
};

export default ThreadCard;
