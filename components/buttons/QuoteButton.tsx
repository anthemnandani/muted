import { Icons } from '@/components/icons';
import type { ParentPostInfo } from '@/lib/types';
import useDialog from '@/store/dialog';
import React from 'react';
import { DropdownMenuItem } from '../ui/dropdown-menu';

interface QuoteButtonProps {
  quoteInfo: ParentPostInfo;
  disabled?: boolean;
}

const QuoteButton: React.FC<QuoteButtonProps> = ({ quoteInfo, disabled }) => {
  const { setOpenDialog, setQuoteInfo } = useDialog();
  return (
    <DropdownMenuItem
      onClick={() => {
        setOpenDialog(true);
        setQuoteInfo(quoteInfo);
      }}
      disabled={disabled}
      className='dropdown-menu-item flex-between py-3.5 px-4 data-[disabled]:pointer-events-auto'
    >
      Quote
      <Icons.quote className='size-5' />
    </DropdownMenuItem>
  );
};

export default QuoteButton;
