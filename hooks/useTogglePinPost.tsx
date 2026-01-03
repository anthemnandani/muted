import { Icons } from '@/components/icons';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

const useTogglePinPost = ({
  postId,
  isPinned,
}: {
  postId: string;
  isPinned: boolean;
}) => {
  const trpcUtils = api.useUtils();
  const { mutateAsync: togglePinPost, isPending } =
    api.post.togglePinPost.useMutation({
      onError: (error, variables, context) => {
        toast.error('Something went wrong!');
      },
      onSettled: async () => {
        await trpcUtils.post.getInfinitePosts.invalidate();
        await trpcUtils.user.getUserProfile.invalidate();
      },
    });

  const handleTogglePinPost = () => {
    toast.promise(togglePinPost({ postId }), {
      loading: (
        <div className='flex w-[270px] items-center justify-start gap-1.5 p-0'>
          <div>
            <Icons.loading className='size-8' />
          </div>
          {isPinned ? 'Unpinning...' : 'Pinning...'}
        </div>
      ),
      success: (data) => (
        <div className='flex-center p-0'>
          {data.pinned ? 'Pinned' : 'Unpinned'}
        </div>
      ),
      error: 'Error',
      richColors: true,
    });
  };

  return { handleTogglePinPost, isLoading: isPending };
};

export default useTogglePinPost;
