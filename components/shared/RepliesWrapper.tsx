import { ThreadCardProps } from '@/lib/types';
import React from 'react';
import ReplyToggleButton from '../buttons/ReplyToggleButton';
import ChildReplyCard from '../cards/ChildReplyCard';
import { Separator } from '../ui/separator';
import ReplyThreadWrapper from './ReplyThreadWrapper';

interface RepliesWrapperProps {
  showReplies: boolean;
  toggleReplies: () => void;
  repliesCount: number;
  children: ThreadCardProps[];
}

const RepliesWrapper: React.FC<RepliesWrapperProps> = ({
  showReplies,
  toggleReplies,
  repliesCount,
  children,
}) => {
  return (
    <div className='px-2 md:px-4'>
      {children.length > 0 && (
        <ReplyToggleButton
          showReplies={showReplies}
          repliesCount={repliesCount}
          onClick={toggleReplies}
        />
      )}
      {showReplies && children.length > 0 && (
        <div className='ml-10'>
          <div className='pb-4'>
            <Separator />
          </div>
          <ReplyThreadWrapper>
            {children.map((reply) => (
              <ChildReplyCard key={reply.id} {...reply} />
            ))}
          </ReplyThreadWrapper>
        </div>
      )}
    </div>
  );
};

export default RepliesWrapper;
