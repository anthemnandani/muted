import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import usePostStore from '@/store/postStore';
import { api } from '@/trpc/react';
import { PostStatus } from '@prisma/client';
import { Eye, EyeOff, ShieldBan, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ConfirmDialog from './ConfirmDialog';

const PostActions = ({ id, status }: { id: string; status: PostStatus }) => {
  const router = useRouter();
  const trpcUtils = api.useUtils();
  const { reset } = usePostStore();

  const { mutateAsync: deletePost, isLoading: isDeletingPost } =
    api.admin.deletePost.useMutation({
      onSettled: async () => {
        await trpcUtils.admin.getAllPosts.invalidate();
      },
    });

  const { mutateAsync: togglePostStatus, isLoading: isTogglingStatus } =
    api.admin.togglePostStatus.useMutation({
      onSettled: async () => {
        await trpcUtils.admin.getAllPosts.invalidate();
      },
    });

  const handleDeletePost = (postId: string) => {
    const promise = deletePost({ id: postId });

    toast.promise(promise, {
      loading: 'Deleting...',
      success: () => 'Deleted',
      error: 'Error deleting post.',
      richColors: true,
    });
  };

  const handleToggleStatus = (postId: string, currentStatus: PostStatus) => {
    const promise = togglePostStatus({ id: postId });
    const action =
      currentStatus === PostStatus.VISIBLE ? 'Hiding' : 'Making visible';
    const successMsg =
      currentStatus === PostStatus.VISIBLE
        ? 'Post is now hidden'
        : 'Post is now visible';

    toast.promise(promise, {
      loading: `${action}...`,
      success: () => successMsg,
      error: 'Error updating status.',
      richColors: true,
    });
  };

  return (
    <div className='inline-flex items-center justify-end gap-1'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='ghost'
            className='size-8 p-0'
            onClick={() => {
              reset();
              router.push(`/post/${id}`);
            }}
          >
            <Eye className='size-4' aria-hidden />
            <span className='sr-only'>View</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>View</TooltipContent>
      </Tooltip>

      <Tooltip>
        <ConfirmDialog
          title={
            status === PostStatus.VISIBLE ? 'Hide post?' : 'Make post visible?'
          }
          description={
            status === PostStatus.VISIBLE
              ? 'The post will be hidden from public view.'
              : 'The post will become visible to everyone again.'
          }
          confirmText={
            status === PostStatus.VISIBLE ? 'Confirm Hide' : 'Confirm Visible'
          }
          isLoading={isTogglingStatus}
          onConfirm={() => handleToggleStatus(id, status)}
        >
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              className='size-8 p-0'
              aria-label={
                status === PostStatus.VISIBLE ? `Hide ${id}` : `Unhide ${id}`
              }
            >
              {status === PostStatus.VISIBLE ? (
                <EyeOff className='size-4' aria-hidden />
              ) : (
                <ShieldBan className='size-4' aria-hidden />
              )}
              <span className='sr-only'>
                {status === PostStatus.VISIBLE ? 'Hide' : 'Unhide'}
              </span>
            </Button>
          </TooltipTrigger>
        </ConfirmDialog>
        <TooltipContent>
          {status === PostStatus.VISIBLE ? 'Hide' : 'Unhide'}
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <ConfirmDialog
          title='Delete post?'
          description='This action permanently removes the post and cannot be undone.'
          confirmText='Delete permanently'
          isLoading={isDeletingPost}
          onConfirm={() => handleDeletePost(id)}
        >
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              className='size-8 p-0 text-destructive hover:text-destructive'
            >
              <Trash2 className='size-4' aria-hidden />
              <span className='sr-only'>Delete</span>
            </Button>
          </TooltipTrigger>
        </ConfirmDialog>
        <TooltipContent>Delete</TooltipContent>
      </Tooltip>
    </div>
  );
};

export default PostActions;
