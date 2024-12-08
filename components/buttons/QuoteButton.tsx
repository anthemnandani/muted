import { Icons } from '@/components/icons';
import type { ParentPostInfo } from '@/lib/types';
import useDialog from '@/store/dialog';
import React from 'react';
import { toast } from 'sonner';
import { DropdownMenuItem } from '../ui/dropdown-menu';

interface QuoteButtonProps {
  quoteInfo: ParentPostInfo;
  disabled?: boolean;
}

const QuoteButton: React.FC<QuoteButtonProps> = ({ quoteInfo, disabled }) => {
  const { setOpenDialog, setQuoteInfo } = useDialog();

  const handleQuoteClick = () => {
    if (disabled) return toast.error('You cannot quote this post');
    setOpenDialog(true);
    setQuoteInfo(quoteInfo);
  };

  return (
    <DropdownMenuItem
      onClick={handleQuoteClick}
      disabled={disabled}
      className='dropdown-menu-item flex-between py-3.5 px-4 data-[disabled]:pointer-events-auto'
    >
      Quote
      <Icons.quote className='size-5' />
    </DropdownMenuItem>
  );
};

export default QuoteButton;
