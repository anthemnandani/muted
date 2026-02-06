import { Icons } from '@/components/icons';
import { QuoteButtonProps } from '@/lib/types';
import { useThreadStore } from '@/store/threadStore';
import React from 'react';
import { toast } from 'sonner';
import { DropdownMenuItem } from '../ui/dropdown-menu';

const QuoteButton: React.FC<QuoteButtonProps> = ({ quoteInfo, disabled }) => {
  const { setOpenDialog, setQuoteInfo } = useThreadStore();

  const handleQuoteClick = () => {
    if (disabled) return toast.error('You cannot quote this thread');
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
