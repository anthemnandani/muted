import { Icons } from '@/components/icons';
import type { ThreadInfo } from '@/lib/types';
import { useThreadStore } from '@/store/threadStore';
import React from 'react';
import { DropdownMenuItem } from '../ui/dropdown-menu';

interface QuoteButtonProps {
  quoteInfo: ThreadInfo;
}

const QuoteButton: React.FC<QuoteButtonProps> = ({ quoteInfo }) => {
  const { setOpenDialog, setQuoteInfo } = useThreadStore();

  const handleQuoteClick = () => {
    // if (disabled) return toast.error('You cannot quote this post');
    setOpenDialog(true);
    setQuoteInfo(quoteInfo);
  };

  return (
    <DropdownMenuItem
      onClick={handleQuoteClick}
      className='dropdown-menu-item flex-between py-3.5 px-4'
    >
      Quote
      <Icons.quote className='size-5' />
    </DropdownMenuItem>
  );
};

export default QuoteButton;
