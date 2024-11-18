'use client';
import { ThreadCardProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';
import { Separator } from '../ui/separator';
import ThreadCardBase from './ThreadCardBase';

const ThreadCard: React.FC<ThreadCardProps> = ({
  isLastThread,
  showUsername,
  parentPost,
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
