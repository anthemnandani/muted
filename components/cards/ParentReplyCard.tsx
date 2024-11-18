'use client';
import { ThreadCardProps } from '@/lib/types';
import React, { useMemo, useState } from 'react';
import RepliesWrapper from '../shared/RepliesWrapper';
import { Separator } from '../ui/separator';
import ThreadCardBase from './ThreadCardBase';

const ParentReplyCard: React.FC<ThreadCardProps> = ({
  postChildren,
  repliesCount,
  author,
  ...props
}) => {
  const [showReplies, setShowReplies] = useState(false);

  const sortedChildren = useMemo(() => {
    if (!postChildren) return [];
    return [...postChildren].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [postChildren]);

  return (
    <>
      <Separator />
      <article className='w-full pt-4'>
        <ThreadCardBase
          {...props}
          author={author}
          repliesCount={repliesCount ?? 0}
          variant='reply'
          className='w-full'
        />

        <RepliesWrapper
          showReplies={showReplies}
          toggleReplies={() => setShowReplies(!showReplies)}
          repliesCount={repliesCount ?? 0}
          children={sortedChildren}
        />
      </article>
    </>
  );
};

export default ParentReplyCard;
