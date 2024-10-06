import React from 'react';
import { Icons } from '../icons';
import { toast } from 'sonner';

interface CopyLinkButtonProps {
  postId: string;
  username: string;
}

const CopyLinkButton: React.FC<CopyLinkButtonProps> = ({
  postId,
  username,
}) => {
  const copyLink = `${process.env.NEXT_PUBLIC_APP_URL}/@${username}/post/${postId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(copyLink);
      toast.success('Copied');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };
  return (
    <div
      className='flex-center hover:bg-primary p-2 rounded-full w-fit h-fit active:scale-95 cursor-pointer'
      onClick={handleCopyLink}
    >
      <Icons.copyLink2 className='size-5 transition-colors duration-150' />
    </div>
  );
};

export default CopyLinkButton;
