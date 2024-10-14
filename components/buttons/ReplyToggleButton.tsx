'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import React from 'react';

interface ReplyToggleButtonProps {
  showReplies: boolean;
  repliesCount: number;
  onClick: () => void;
}

const ReplyToggleButton: React.FC<ReplyToggleButtonProps> = ({
  showReplies,
  repliesCount,
  onClick,
}) => {
  return (
    <button
      className='text-gray-3 hover:text-blue transition-all ease-in-out duration-300 mt-2 text-[15px] flex items-center gap-1'
      onClick={onClick}
    >
      {showReplies ? (
        <>
          Hide Replies
          <ChevronUp className='w-4 h-4' />
        </>
      ) : (
        <>
          View Replies ({repliesCount})
          <ChevronDown className='w-4 h-4' />
        </>
      )}
    </button>
  );
};

export default ReplyToggleButton;
