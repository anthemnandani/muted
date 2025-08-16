'use client';

import Link from 'next/link';
import { Fragment } from 'react';

const urlRegex =
  /(?:https?:\/\/)?(?:[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+(?:\/[^\s]*)?)/;
const hashtagRegex = /#(?:[\w.+?!,@$%&*()-]+[a-zA-Z0-9_$]+)/;

const tokenRegex = new RegExp(
  `(${urlRegex.source}|${hashtagRegex.source})`,
  'g'
);

const ParsedText: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(tokenRegex).filter(Boolean);

  return (
    <Fragment>
      {parts.map((part, index) => {
        if (hashtagRegex.test(part)) {
          const tag = part.substring(1);
          return (
            <Link
              key={index}
              href={`/feed/${tag}`}
              className='!text-primary-blue hover:underline'
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }

        if (urlRegex.test(part)) {
          const fullUrl = part.startsWith('http') ? part : `https://${part}`;
          const domain = part.replace(/^https?:\/\//, '');
          const displayUrl = domain.slice(0, 25);
          return (
            <a
              key={index}
              href={fullUrl}
              className='text-primary-blue hover:underline break-all'
              target='_blank'
              rel='noopener noreferrer'
              onClick={(e) => e.stopPropagation()}
            >
              {displayUrl}
              {displayUrl.length < domain.length ? '...' : ''}
            </a>
          );
        }

        return <Fragment key={index}>{part}</Fragment>;
      })}
    </Fragment>
  );
};

export default ParsedText;
