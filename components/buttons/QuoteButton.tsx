import { Icons } from '@/components/icons';
import type { PostProps } from '@/lib/types';
import useDialog from '@/store/dialog';
import React from 'react';
import { DropdownMenuItem } from '../ui/dropdown-menu';

interface QuoteButtonProps {
  quoteInfo: Pick<PostProps, 'id' | 'text' | 'author'> & {
    createdAt?: Date;
  };
}

const QuoteButton: React.FC<QuoteButtonProps> = ({ quoteInfo }) => {
  const { setOpenDialog, setQuoteInfo } = useDialog();
  return (
    <DropdownMenuItem
      className='dropdown-menu-item flex-between py-3.5 px-4'
      onClick={() => {
        setOpenDialog(true);
        setQuoteInfo(quoteInfo);
      }}
    >
      Quote
      <Icons.quote className='size-5' />
    </DropdownMenuItem>
  );
};

export default QuoteButton;
