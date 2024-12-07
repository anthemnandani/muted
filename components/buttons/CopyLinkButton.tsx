import useCopyLink from '@/hooks/useCopyLink';
import React from 'react';
import { Icons } from '../icons';

interface CopyLinkButtonProps {
  postId: string;
  username: string;
}

const CopyLinkButton: React.FC<CopyLinkButtonProps> = ({
  postId,
  username,
}) => {
  const { handleCopyLink } = useCopyLink({ postId, username });
  return (
    <div className='icon-container-hover' onClick={handleCopyLink}>
      <Icons.copyLink2 className='size-5 transition-colors duration-150' />
    </div>
  );
};

export default CopyLinkButton;
