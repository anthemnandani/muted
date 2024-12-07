import { toast } from 'sonner';

const useCopyLink = ({
  postId,
  username,
}: {
  postId: string;
  username: string;
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

  return { handleCopyLink };
};

export default useCopyLink;
