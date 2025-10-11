import ConfirmDialog from '@/components/modals/ConfirmDialog';
import MenuItem from '@/components/shared/MenuItem';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import useDeletePost from '@/hooks/useDeletePost';
import { cn } from '@/lib/utils';
import useDeletePostStore from '@/store/deletePost';
import usePostStore from '@/store/postStore';
import { api } from '@/trpc/react';
import { PostStatus } from '@prisma/client';
import { Eye, EyeOff, MoreHorizontal, ShieldBan } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const PostActions = ({ id, status }: { id: string; status: PostStatus }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();
  const trpcUtils = api.useUtils();
  const { reset } = usePostStore();

  const { handleDeletePost, isDeleting } = useDeletePost({
    postId: id,
    isAdmin: true,
  });

  const { openDeleteDialog, setOpenDeleteDialog } = useDeletePostStore();

  const { mutateAsync: togglePostStatus, isLoading: isTogglingStatus } =
    api.admin.togglePostStatus.useMutation({
      onSettled: async () => {
        await trpcUtils.admin.getAllPosts.invalidate();
      },
    });

  const handleToggleStatus = () => {
    setIsOpen(false);
    setIsMenuOpen(false);
    const promise = togglePostStatus({ id });
    const action = status === PostStatus.VISIBLE ? 'Hiding' : 'Making visible';
    const successMsg =
      status === PostStatus.VISIBLE
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
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <div
          className={cn(
            'relative h-12 flex-center cursor-pointer transition-all duration-200 drop-shadow-lg group',
            'before:content-[""] before:absolute before:size-10 before:rounded-full before:bg-white-13',
            'hover:before:scale-100 before:scale-0 before:transition-transform before:duration-200'
          )}
        >
          <MoreHorizontal className='aspect-square object-cover object-center size-6 overflow-hidden flex-1 text-white z-10' />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align='end'
        className='dropdown-content-container w-[175px] p-0 rounded-lg'
      >
        <MenuItem
          icon={Eye}
          label='View'
          onClick={() => {
            reset();
            router.push(`/post/${id}`);
          }}
        />
        <Separator />
        <ConfirmDialog
          open={isOpen}
          setOpen={(value) => setIsOpen(value)}
          title={
            status === PostStatus.VISIBLE ? 'Hide post' : 'Make post visible'
          }
          description={
            status === PostStatus.VISIBLE
              ? 'The post will be hidden from public view.'
              : 'The post will become visible to everyone again.'
          }
          btnTitle={
            status === PostStatus.VISIBLE ? 'Confirm Hide' : 'Confirm Visible'
          }
          btnClassName={
            status === PostStatus.HIDDEN
              ? 'text-primary-blue hover:text-primary-blue/75'
              : ''
          }
          isLoading={isTogglingStatus}
          onClick={handleToggleStatus}
          closeMenu={() => setIsMenuOpen(false)}
          trigger={
            <MenuItem
              icon={status === PostStatus.VISIBLE ? EyeOff : ShieldBan}
              label={status === PostStatus.VISIBLE ? 'Hide' : 'Unhide'}
            />
          }
        />
        <Separator />
        <ConfirmDialog
          open={openDeleteDialog}
          setOpen={setOpenDeleteDialog}
          closeMenu={() => setIsMenuOpen(false)}
          title='Delete Post'
          description="If you delete this post, you won't be able to restore it."
          onClick={handleDeletePost}
          isLoading={isDeleting}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PostActions;
