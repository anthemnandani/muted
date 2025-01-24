import { AuthorInfoProps } from '@/lib/types';
import { cn, highlightHashtagsAndUrls } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import React from 'react';
import Username from '../user/Username';

interface ThreadTextProps {
  text: string;
  mentions?: Array<{
    user: AuthorInfoProps;
    index: number;
  }>;
  variant?: 'default' | 'reply';
}

const ThreadText: React.FC<ThreadTextProps> = ({
  text,
  mentions,
  variant = 'default',
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const router = useRouter();
  const MAX_LENGTH = 275;

  const shouldTruncate = text.length > MAX_LENGTH;

  const displayText =
    !isExpanded && shouldTruncate ? text.slice(0, MAX_LENGTH) + '...' : text;

  const handleShowMoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleClick = React.useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.classList.contains('hashtag-link')) {
        e.preventDefault();
        const href = target.getAttribute('href');
        if (href) {
          router.push(href);
        }
      }
    },
    [router]
  );

  if (!mentions || mentions.length === 0) {
    return (
      <div
        className={cn(
          'text-accent-foreground text-[16px] font-normal leading-[1.4em] antialiased whitespace-pre-line px-2 md:px-4 my-3 break-words',
          variant === 'reply' && 'max-md:max-w-full'
        )}
      >
        <span
          dangerouslySetInnerHTML={{
            __html: highlightHashtagsAndUrls(displayText.replace(/\\n/g, '\n')),
          }}
          onClick={handleClick}
        />
        {shouldTruncate && !isExpanded && (
          <button
            onClick={handleShowMoreClick}
            className='font-semibold text-gray-3 hover:cursor-pointer hover:text-primary-blue ml-1'
          >
            show more
          </button>
        )}
      </div>
    );
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  const sortedMentions = [...mentions].sort((a, b) => a.index - b.index);

  sortedMentions.forEach((mention, index) => {
    if (mention.index > lastIndex) {
      const textPart = displayText.slice(lastIndex, mention.index);
      parts.push(
        <span
          key={index}
          dangerouslySetInnerHTML={{
            __html: textPart.replace(/\\n/g, '\n'),
          }}
        />
      );
    }

    const mentionEnd =
      displayText.indexOf(' ', mention.index) === -1
        ? displayText.length
        : displayText.indexOf(' ', mention.index);

    parts.push(
      <span
        key={`mention-${mention.index}-start`}
        className='!text-primary-blue'
      >
        @
      </span>
    );

    parts.push(
      <Username
        key={`mention-${mention.index}`}
        author={mention.user}
        className='!text-primary-blue'
      />
    );

    lastIndex = mentionEnd;
  });

  if (lastIndex < displayText.length) {
    parts.push(
      <span
        key={`text-${lastIndex}`}
        dangerouslySetInnerHTML={{
          __html: displayText.slice(lastIndex).replace(/\\n/g, '\n'),
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        'text-accent-foreground text-[16px] font-normal leading-[1.4em] antialiased whitespace-pre-line px-2 md:px-4 my-3 break-words',
        variant === 'reply' && 'max-md:max-w-full'
      )}
    >
      {parts}
      {shouldTruncate && !isExpanded && (
        <button
          onClick={handleShowMoreClick}
          className='font-semibold text-gray-3 hover:cursor-pointer hover:text-primary-blue ml-1'
        >
          show more
        </button>
      )}
    </div>
  );
};

export default ThreadText;
