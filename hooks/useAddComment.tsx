import { Icons } from '@/components/icons';
import useAddCommentStore from '@/store/addComment';
import { api } from '@/trpc/react';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UseAddCommentProps {
  postId?: string;
  threadId?: string;
  authorId: string;
}

const useAddComment = ({ postId, threadId, authorId }: UseAddCommentProps) => {
  const router = useRouter();
  const trpcUtils = api.useUtils();

  const { commentText, reset, validMentions } = useAddCommentStore();

  const { mutateAsync: replyToPost, isPending: isCommentingPost } =
    api.post.replyToPost.useMutation({
      onMutate: () => {
        reset();
      },
      onError: (err) => {
        if (err.data?.code === 'UNAUTHORIZED') {
          return router.push('/sign-in');
        }
        if (err.data?.code === 'FORBIDDEN') {
          return toast.error('You are not allowed to reply to this post');
        }
        toast.error('ReplyingError: Something went wrong!');
      },
      onSuccess: async () => {
        await trpcUtils.invalidate();
      },
      retry: false,
    });

  const { mutateAsync: commentToThread, isPending: isCommentingThread } =
    api.thread.commentToThread.useMutation({
      onMutate: () => {
        reset();
      },
      onError: (err) => {
        if (err.data?.code === 'UNAUTHORIZED') {
          return router.push('/sign-in');
        }
        if (err.data?.code === 'FORBIDDEN') {
          return toast.error('You are not allowed to reply to this thread');
        }
        toast.error('ReplyingError: Something went wrong!');
      },
      onSettled: () => {
        trpcUtils.thread.getComments.invalidate({ id: threadId! });
        trpcUtils.thread.getThreadById.invalidate({ id: threadId! });
      },
    });

  const handlePostComment = () => {
    const promise = replyToPost({
      postId: postId!,
      text: commentText,
      postAuthor: authorId,
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
          Commenting...
        </div>
      ),
      success: () => {
        return (
          <div className='flex-between w-[270px] p-0 '>
            <div className='flex-center gap-1.5'>
              <Check className='size-5' />
              Commented
            </div>
          </div>
        );
      },
      richColors: true,
    });
  };

  const handleThreadComment = () => {
    const promise = commentToThread({
      id: threadId!,
      threadAuthor: authorId,
      text: commentText.trim(),
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
          Commenting...
        </div>
      ),
      success: () => {
        return (
          <div className='flex-between w-[270px] p-0 '>
            <div className='flex-center gap-1.5'>
              <Check className='size-5' />
              Commented
            </div>
          </div>
        );
      },
      richColors: true,
    });
  };

  return {
    handleThreadComment,
    handlePostComment,
    isCommentingPost,
    isCommentingThread,
  };
};

export default useAddComment;
