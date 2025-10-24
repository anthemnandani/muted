import ConfirmDialog from '@/components/modals/ConfirmDialog';
import IssueStrike from '@/components/modals/IssueStrike';
import { Button } from '@/components/ui/button';
import { api } from '@/trpc/react';
import { PostStatus } from '@prisma/client';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const PostActions = ({
  id,
  status,
  userId,
}: {
  id: string;
  status: PostStatus;
  userId: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const trpcUtils = api.useUtils();

  const { mutateAsync: togglePostStatus, isLoading: isTogglingStatus } =
    api.admin.togglePostStatus.useMutation({
      onSettled: async () => {
        await trpcUtils.admin.getAllPosts.invalidate();
      },
    });

  const handleToggleStatus = () => {
    setIsOpen(false);
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
    <div className='flex-center gap-1'>
      <ConfirmDialog
        open={isOpen}
        setOpen={(value) => setIsOpen(value)}
        title={
          status === PostStatus.VISIBLE ? 'Hide Post' : 'Make Post Visible'
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
        trigger={
          <Button
            variant='ghost'
            size='icon'
            className='hover:bg-white/10'
            title={status === PostStatus.VISIBLE ? 'Hide' : 'Unhide'}
          >
            {status === PostStatus.VISIBLE ? (
              <EyeOff className='size-5 text-white/80' />
            ) : (
              <Eye className='size-5 text-white/80' />
            )}
            <span className='sr-only'>
              {status === PostStatus.VISIBLE ? 'Hide post' : 'Unhide post'}
            </span>
          </Button>
        }
      />
      <IssueStrike userId={userId} postId={id} />
    </div>
  );
};

export default PostActions;
