import { Icons } from '@/components/icons';
import { extractMentions } from '@/lib/utils';
import useAddCommentStore from '@/store/addComment';
import { api } from '@/trpc/react';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const useAddReply = ({
  postId,
  commentId,
}: {
  postId: string;
  commentId: string;
}) => {
  const router = useRouter();
  const trpcUtils = api.useUtils();

  const { reset } = useAddCommentStore();

  const { isLoading: isReplying, mutateAsync: addReply } =
    api.post.replyToComment.useMutation({
      onMutate: () => {
        reset();
      },
      onError: (err) => {
        toast.error('ReplyingError: Something went wrong!');
        if (err.data?.code === 'UNAUTHORIZED') {
          router.push('/sign-in');
        }
      },
      onSettled: async () => {
        await trpcUtils.invalidate();
      },
      retry: false,
    });

  const handleAddReply = (text: string) => {
    const extractedMentions = extractMentions(text);

    const promise = addReply({
      parentCommentId: commentId,
      originalPostId: postId,
      text,
      mentions: extractedMentions,
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
      error: 'Error',
      richColors: true,
    });

    return promise;
  };

  return {
    handleAddReply,
    isReplying,
  };
};

export default useAddReply;
