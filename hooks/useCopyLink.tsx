import { toast } from 'sonner';

const useCopyLink = ({
  postId,
  username,
}: {
  postId?: string;
  username: string;
}) => {
  const handleCopyLink = async () => {
    try {
      const copyLink = `${process.env.NEXT_PUBLIC_APP_URL}/@${username}/post/${postId}`;
      await navigator.clipboard.writeText(copyLink);
      toast.success('Copied');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleCopyProfileLink = async () => {
    try {
      const copyLink = `${process.env.NEXT_PUBLIC_APP_URL}/@${username}`;
      await navigator.clipboard.writeText(copyLink);
      toast.success('Copied');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };
  return { handleCopyLink, handleCopyProfileLink };
};

export default useCopyLink;
