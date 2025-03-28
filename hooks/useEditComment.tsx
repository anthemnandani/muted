import { Icons } from '@/components/icons';
import useAddCommentStore from '@/store/addComment';
import { api } from '@/trpc/react';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const useEditComment = () => {
  const router = useRouter();
  const trpcUtils = api.useUtils();

  const { commentText, editCommentId, reset } = useAddCommentStore();

  const { isLoading: isEditing, mutateAsync: editComment } =
    api.post.editPost.useMutation({
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

  const handleEdit = () => {
    const promise = editComment({
      id: editCommentId,
      text: commentText,
    });

    toast.promise(promise, {
      loading: (
        <div className='flex w-[270px] items-center justify-start gap-1.5 p-0'>
          <div>
            <Icons.loading className='size-8' />
          </div>
          Editing...
        </div>
      ),
      success: () => {
        return (
          <div className='flex-between w-[270px] p-0 '>
            <div className='flex-center gap-1.5'>
              <Check className='size-5' />
              Edited
            </div>
          </div>
        );
      },
      error: 'Error',
      richColors: true,
    });
  };
  return {
    handleEdit,
    isEditing,
  };
};

export default useEditComment;
