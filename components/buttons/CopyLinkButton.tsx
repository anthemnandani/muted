import useCopyLink from '@/hooks/useCopyLink';
import { CopyLinkButtonProps } from '@/lib/types';
import React from 'react';
import { Icons } from '../icons';

const CopyLinkButton: React.FC<CopyLinkButtonProps> = ({
  postId,
  threadId,
  username,
}) => {
  const { handleCopyLink } = useCopyLink({ postId, threadId, username });
  return (
    <div className='icon-container-hover' onClick={handleCopyLink}>
      <Icons.copyLink2 className='size-5 transition-colors duration-150' />
    </div>
  );
};

export default CopyLinkButton;
