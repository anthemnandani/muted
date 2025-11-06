'use client';

import { PostTextProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Username from '../user/Username';
import ParsedText from './ParsedText';

const PostText: React.FC<PostTextProps> = ({
  text,
  className,
  showMore = true,
  mentions,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_LENGTH = 69;
  const MAX_EXPANDED_LENGTH = 500;

  if (!text) return null;

  const shouldTruncate = text.length > MAX_LENGTH && showMore;

  const displayText =
    !isExpanded && shouldTruncate
      ? text.slice(0, MAX_LENGTH)
      : text.length > MAX_EXPANDED_LENGTH
      ? text.slice(0, MAX_EXPANDED_LENGTH) + '...'
      : text;

  const handleShowMoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  if (!mentions || mentions.length === 0) {
    return (
      <div
        className={cn(
          'relative text-white/90 font-medium text-sm antialiased whitespace-pre-line break-words',
          className
        )}
      >
        <ParsedText text={displayText} />
        {shouldTruncate && !isExpanded && (
          <button
            type='button'
            aria-label='Show more'
            onClick={handleShowMoreClick}
            className='font-semibold text-primary-blue hover:cursor-pointer ml-1'
          >
            more
          </button>
        )}
      </div>
    );
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  const sortedMentions = [...mentions].sort((a, b) => a.index - b.index);

  sortedMentions.forEach((mention, i) => {
    const mentionString = `@${mention.user.username}`;
    const mentionStartIndex = displayText.indexOf(mentionString, lastIndex);

    if (mentionStartIndex === -1) return;

    if (mentionStartIndex > lastIndex) {
      const textPart = displayText.slice(lastIndex, mentionStartIndex);
      parts.push(<ParsedText key={`text-${i}`} text={textPart} />);
    }

    parts.push(
      <Username
        key={`mention-${i}`}
        author={mention.user}
        className='!text-primary-blue hover:underline'
        isMention
      />
    );

    lastIndex = mentionStartIndex + mentionString.length;
  });

  if (lastIndex < displayText.length) {
    const remainingText = displayText.slice(lastIndex);
    parts.push(<ParsedText key='text-end' text={remainingText} />);
  }

  return (
    <div
      className={cn(
        'relative text-white/90 font-medium text-sm antialiased whitespace-pre-line break-words',
        className
      )}
    >
      {parts}
      {shouldTruncate && !isExpanded && (
        <button
          type='button'
          aria-label='Show more'
          onClick={handleShowMoreClick}
          className='font-semibold text-primary-blue hover:cursor-pointer ml-1'
        >
          more
        </button>
      )}
    </div>
  );
};

export default PostText;
