'use client';
import type { PostCardProps } from '@/lib/types';
import React, { useMemo, useState } from 'react';
import RepliesWrapper from '../shared/RepliesWrapper';
import ThreadCardBase from './ThreadCardBase';

const ChildReplyCard: React.FC<PostCardProps> = ({
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
    <article className='w-full'>
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
  );
};

export default ChildReplyCard;
