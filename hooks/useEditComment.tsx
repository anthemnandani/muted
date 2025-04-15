'use client';

import { Icons } from '@/components/icons';
import { extractMentions } from '@/lib/utils';
import useAddCommentStore from '@/store/addComment';
import { api } from '@/trpc/react';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const useEditComment = () => {
  const router = useRouter();
  const trpcUtils = api.useUtils();

  const { commentText, editCommentId, reset, resetReply } =
    useAddCommentStore();

  const { isLoading: isEditing, mutateAsync: editComment } =
    api.post.editPost.useMutation({
      onMutate: () => {
        reset();
        resetReply();
      },
      onError: (err) => {
        toast.error('EditingError: Something went wrong!');
        if (err.data?.code === 'UNAUTHORIZED') {
          router.push('/sign-in');
        }
      },
      onSettled: async () => {
        await trpcUtils.invalidate();
      },
      retry: false,
    });

  const handleEdit = (id?: string, text?: string) => {
    const postId = id || editCommentId;
    const content = text || commentText;

    if (!postId || !content.trim()) return;

    const extractedMentions = extractMentions(content);

    const promise = editComment({
      id: postId,
      text: content,
      mentions: extractedMentions,
    });

    toast.promise(promise, {
      loading: (
        <div className='flex w-[270px] items-center justify-start gap-1.5 p-0'>
          <div>
            <Icons.loading className='size-8' />
          </div>
          Updating...
        </div>
      ),
      success: () => {
        return (
          <div className='flex-between w-[270px] p-0 '>
            <div className='flex-center gap-1.5'>
              <Check className='size-5' />
              Updated
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
    handleEdit,
    isEditing,
  };
};

export default useEditComment;
