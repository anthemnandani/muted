'use client';

import { Icons } from '@/components/icons';
import useAddCommentStore from '@/store/addComment';
import { api } from '@/trpc/react';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const useEditComment = () => {
  const router = useRouter();
  const trpcUtils = api.useUtils();

  const { commentText, editCommentId, reset, resetReply, validMentions } =
    useAddCommentStore();

  const { mutateAsync: editComment, isPending: isEditing } =
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
        await trpcUtils.post.getComments.invalidate();
      },
      retry: false,
    });

  const { mutateAsync: editThreadComment, isPending: isEditingThread } =
    api.thread.editThread.useMutation({
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
      onSuccess: () => {
        reset();
        resetReply();
      },
      onSettled: () => {
        trpcUtils.thread.getComments.invalidate();
        trpcUtils.thread.getReplies.invalidate();
      },
      retry: false,
    });

  const handleEditPostComment = (id?: string, text?: string) => {
    const postId = id || editCommentId;
    const content = text || commentText;

    if (!postId || !content.trim()) return;

    const promise = editComment({
      id: postId,
      text: content,
      mentions: validMentions.map((mention) => ({
        username: mention.username,
        index: mention.startIndex,
      })),
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

  const handleEditThreadComment = (id?: string, text?: string) => {
    const threadId = id || editCommentId;
    const content = text || commentText;

    if (!threadId || !content.trim()) return;

    const promise = editThreadComment({
      id: threadId,
      text: content,
      mentions: validMentions.map((m) => ({
        mentionedUserId: m.mentionedUserId,
        index: m.startIndex,
      })),
      linkPreview: null,
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
    handleEditPostComment,
    handleEditThreadComment,
    isEditing,
    isEditingThread,
  };
};

export default useEditComment;
