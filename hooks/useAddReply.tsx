import { Icons } from '@/components/icons';
import useAddCommentStore from '@/store/addComment';
import { api } from '@/trpc/react';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UseAddReplyProps {
  postId?: string;
  threadId?: string;
  commentId: string;
}

const useAddReply = ({ postId, threadId, commentId }: UseAddReplyProps) => {
  const router = useRouter();
  const trpcUtils = api.useUtils();

  const { resetReply, validMentions } = useAddCommentStore();

  const { mutateAsync: addPostReply, isPending: isReplyingPost } =
    api.post.replyToComment.useMutation({
      onMutate: () => {
        resetReply();
      },
      onError: (err) => {
        if (err.data?.code === 'UNAUTHORIZED') {
          return router.push('/sign-in');
        }
        if (err.data?.code === 'FORBIDDEN') {
          return toast.error('You are not allowed to reply to this comment');
        }
        toast.error('ReplyingError: Something went wrong!');
      },
      onSuccess: () => {
        trpcUtils.post.invalidate();
      },
      retry: false,
    });

  const { mutateAsync: addThreadReply, isPending: isReplyingThread } =
    api.thread.replyToComment.useMutation({
      onMutate: () => {
        resetReply();
      },
      onError: (err) => {
        if (err.data?.code === 'UNAUTHORIZED') {
          return router.push('/sign-in');
        }
        if (err.data?.code === 'FORBIDDEN') {
          return toast.error('You are not allowed to reply to this comment');
        }
        toast.error('ReplyingError: Something went wrong!');
      },
      onSettled: () => {
        trpcUtils.thread.invalidate();
      },
      retry: false,
    });

  const handlePostReply = (text: string) => {
    const promise = addPostReply({
      parentCommentId: commentId,
      originalPostId: postId!,
      text,
      mentions: validMentions.map((mention) => ({
        mentionedUserId: mention.mentionedUserId,
        index: mention.startIndex,
      })),
    });

    toast.promise(promise, {
      loading: (
        <div className='flex w-[270px] items-center justify-start gap-1.5 p-0'>
          <div>
            <Icons.loading className='size-8' />
          </div>
          Replying...
        </div>
      ),
      success: () => {
        return (
          <div className='flex-between w-[270px] p-0 '>
            <div className='flex-center gap-1.5'>
              <Check className='size-5' />
              Replied
            </div>
          </div>
        );
      },
      richColors: true,
    });

    return promise;
  };

  const handleThreadReply = (text: string) => {
    const promise = addThreadReply({
      parentCommentId: commentId,
      originalThreadId: threadId!,
      text,
      mentions: validMentions.map((m) => ({
        mentionedUserId: m.mentionedUserId,
        index: m.startIndex,
      })),
    });

    toast.promise(promise, {
      loading: (
        <div className='flex w-[270px] items-center justify-start gap-1.5 p-0'>
          <div>
            <Icons.loading className='size-8' />
          </div>
          Replying...
        </div>
      ),
      success: () => {
        return (
          <div className='flex-between w-[270px] p-0 '>
            <div className='flex-center gap-1.5'>
              <Check className='size-5' />
              Replied
            </div>
          </div>
        );
      },
      richColors: true,
    });
  };

  return {
    handlePostReply,
    handleThreadReply,
    isReplyingPost,
    isReplyingThread,
  };
};

export default useAddReply;
