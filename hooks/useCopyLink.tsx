import { toast } from 'sonner';

interface Props {
  postId?: string;
  threadId?: string;
  username?: string;
}

const useCopyLink = ({ postId, threadId, username }: Props) => {
  const link = postId ? `post/${postId}` : `thread/${threadId}`;

  const handleCopyLink = async () => {
    try {
      const copyLink = `${process.env.NEXT_PUBLIC_APP_URL}/${link}`;
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
