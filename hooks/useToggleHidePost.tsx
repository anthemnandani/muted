import { useHiddenPosts } from '@/store/hiddenPosts';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

interface UseToggleHidePostProps {
  postId: string;
  setIsOpen?: (open: boolean) => void;
}

export default function useToggleHidePost({
  postId,
  setIsOpen,
}: UseToggleHidePostProps) {
  const { hidePost, unhidePost } = useHiddenPosts();
  const trpcUtils = api.useUtils();

  const { mutateAsync: toggleHidePost, isLoading } =
    api.post.toggleHidePost.useMutation({
      onMutate: () => {
        setIsOpen?.(false);
        const isCurrentlyHidden = useHiddenPosts
          .getState()
          .isTemporarilyHidden(postId);
        isCurrentlyHidden ? unhidePost(postId) : hidePost(postId);
      },
      onError: () => {
        toast.error('Something went wrong!');
      },
      onSettled: async (data) => {
        toast.success(data?.hidden ? 'Hidden' : 'Unhidden');
        await trpcUtils.invalidate();
      },
    });

  // const handleToggleHidePost = () => {
  //   toast.promise(toggleHidePost({ postId }), {
  //     loading: (
  //       <div className='flex w-[270px] items-center justify-start gap-1.5 p-0'>
  //         <div>
  //           <Icons.loading className='size-8' />
  //         </div>
  //         {isHiding ? `Hiding ${type}...` : `Unhiding ${type}...`}
  //       </div>
  //     ),
  //     success: () => (
  //       <div className='flex-center p-0'>
  //         {isHiding
  //           ? `${
  //               type.charAt(0).toUpperCase() + type.slice(1)
  //             } hidden successfully`
  //           : `${
  //               type.charAt(0).toUpperCase() + type.slice(1)
  //             } unhidden successfully`}
  //       </div>
  //     ),
  //     error: isHiding ? `Error hiding ${type}` : `Error unhiding ${type}`,
  //     richColors: true,
  //   });
  // };

  return {
    handleToggleHidePost: toggleHidePost,
    isLoading,
  };
}
