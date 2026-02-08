import { Mention } from '@/lib/types';
import { cn, highlightTextContent } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import React from 'react';
import Username from '../user/Username';

interface ThreadTextProps {
  text: string;
  mentions?: Mention[];
}

const ThreadText: React.FC<ThreadTextProps> = ({ text, mentions }) => {
  const router = useRouter();

  const containerClasses = cn(
    'text-accent-foreground font-normal leading-[1.4em] antialiased whitespace-pre-line break-words',
    'text-[16px] px-2 md:px-4 my-3',
  );

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
    [router],
  );

  if (!mentions || mentions.length === 0) {
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: highlightTextContent(text.replace(/\\n/g, '\n')),
        }}
        onClick={handleClick}
        className={containerClasses}
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
        />,
      );
    }

    const mentionEnd =
      text.indexOf(' ', mention.index) === -1
        ? text.length
        : text.indexOf(' ', mention.index);

    parts.push(<span className='!text-primary-blue'>@</span>);

    parts.push(
      <Username
        key={`mention-${mention.index}`}
        author={mention.user}
        className='!text-primary-blue'
      />,
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
      />,
    );
  }

  return <div className={containerClasses}>{parts}</div>;
};

export default ThreadText;
