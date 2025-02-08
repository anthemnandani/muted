import { Icons } from '@/components/icons';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

interface UseHideLikesProps {
  postId: string;
  hideLikes: boolean;
}

export default function useHideLikes({ postId, hideLikes }: UseHideLikesProps) {
  const trpcUtils = api.useUtils();

  const { mutateAsync: toggleHideLikes, isLoading } =
    api.post.toggleHideLikes.useMutation({
      onError: () => {
        toast.error('Something went wrong!');
      },
      onSettled: async () => {
        await trpcUtils.invalidate();
      },
    });

  const handleToggleHideLikes = () => {
    toast.promise(toggleHideLikes({ postId, hide: !hideLikes }), {
      loading: (
        <div className='flex w-[270px] items-center justify-start gap-1.5 p-0'>
          <div>
            <Icons.loading className='size-8' />
          </div>
          {hideLikes ? 'Unhiding...' : 'Hiding...'}
        </div>
      ),
      success: () => (
        <div className='flex-center p-0'>
          {hideLikes ? 'Likes unhidden' : 'Likes hidden'}
        </div>
      ),
      error: 'Error',
      richColors: true,
    });
  };

  return {
    handleToggleHideLikes,
    isLoading,
  };
}
