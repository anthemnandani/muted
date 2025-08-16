import { CommentTextProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import ParsedText from '../shared/ParsedText';
import Username from '../user/Username';

const CommentText: React.FC<CommentTextProps> = ({
  text,
  mentions,
  className,
}) => {
  const router = useRouter();
  const handleClick = useCallback(
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
      <div className='text-[0.9rem] leading-[1.1375rem] mt-1 text-white/90 break-words whitespace-pre-line antialiased'>
        <ParsedText text={text.replace(/\\n/g, '\n')} />
      </div>
    );
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  const sortedMentions = [...mentions].sort((a, b) => a.index - b.index);

  sortedMentions.forEach((mention, index) => {
    if (mention.index > lastIndex) {
      const textPart = text.slice(lastIndex, mention.index);
      parts.push(
        <ParsedText key={index} text={textPart.replace(/\\n/g, '\n')} />
      );
    }

    const mentionEnd =
      text.indexOf(' ', mention.index) === -1
        ? text.length
        : text.indexOf(' ', mention.index);

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

  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex).replace(/\\n/g, '\n');
    parts.push(<ParsedText key={`text-${lastIndex}`} text={remainingText} />);
  }

  return (
    <div
      className={cn(
        'text-[0.9rem] leading-[1.1375rem] mt-1 text-white/90 break-words whitespace-pre-line antialiased',
        className
      )}
    >
      {parts}
    </div>
  );
};

export default CommentText;
