import { AuthorInfoProps } from '@/lib/types';
import { cn } from '@/lib/utils';
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
  if (!mentions || mentions.length === 0) {
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: text.replace(/\\n/g, '\n'),
        }}
        className={cn(
          'text-accent-foreground text-[16px] font-normal leading-[1.4em] antialiased whitespace-pre-line px-2 md:px-4 my-3',
          variant === 'reply' && 'max-md:max-w-full'
        )}
      />
    );
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  const sortedMentions = [...mentions].sort((a, b) => a.index - b.index);

  sortedMentions.forEach((mention, index) => {
    if (mention.index > lastIndex) {
      parts.push(
        <span
          key={index}
          dangerouslySetInnerHTML={{
            __html: text.slice(lastIndex, mention.index).replace(/\\n/g, '\n'),
          }}
        />
      );
    }

    const mentionEnd =
      text.indexOf(' ', mention.index) === -1
        ? text.length
        : text.indexOf(' ', mention.index);

    parts.push(<span className='!text-[#18a3fe]'>@</span>);

    parts.push(
      <Username
        key={`mention-${mention.index}`}
        author={mention.user}
        className='!text-[#18a3fe]'
      />
    );

    lastIndex = mentionEnd;
  });

  if (lastIndex < text.length) {
    parts.push(
      <span
        key={`text-${lastIndex}`}
        dangerouslySetInnerHTML={{
          __html: text.slice(lastIndex).replace(/\\n/g, '\n'),
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        'text-accent-foreground text-[16px] font-normal leading-[1.4em] antialiased whitespace-pre-line px-2 md:px-4 my-3',
        variant === 'reply' && 'max-md:max-w-full'
      )}
    >
      {parts}
    </div>
  );
};

export default ThreadText;
