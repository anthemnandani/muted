import { Icons } from '@/components/icons';
import useAddCommentStore from '@/store/addComment';
import { api } from '@/trpc/react';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const useAddComment = ({
  postId,
  authorId,
}: {
  postId: string;
  authorId: string;
}) => {
  const router = useRouter();
  const trpcUtils = api.useUtils();

  const { commentText, reset, validMentions } = useAddCommentStore();

  const { isPending: isReplying, mutateAsync: replyToPost } =
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

  const handleReply = () => {
    const promise = replyToPost({
      postId,
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

  return {
    handleReply,
    isReplying,
  };
};

export default useAddComment;
