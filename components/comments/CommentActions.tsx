import useDeletePost from '@/hooks/useDeletePost';
import useTimeLeft from '@/hooks/useTimeLeft';
import { CommentActionsProps } from '@/lib/types';
import { cn, formatTimeLeft } from '@/lib/utils';
import useAddCommentStore from '@/store/addComment';
import useDeletePostStore from '@/store/deletePost';
import { useUser } from '@clerk/nextjs';
import { DropdownMenu } from '@radix-ui/react-dropdown-menu';
import { Edit, MoreVertical } from 'lucide-react';
import { Fragment, useState } from 'react';
import { Icons } from '../icons';
import ConfirmDialog from '../modals/ConfirmDialog';
import MenuItem from '../shared/MenuItem';
import { DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useReportStore } from '@/store/reportStore';

const CommentActions = ({
  authorId,
  postAuthorId,
  postId,
  createdAt,
  text,
  isReply,
  onEditClick,
}: CommentActionsProps) => {
  const { user } = useUser();
  const { timeLeft } = useTimeLeft({ createdAt });
  const { startEditing } = useAddCommentStore();
  const { openPostReport } = useReportStore();
  const [isOpen, setIsOpen] = useState(false);
  const { openDeleteDialog, setOpenDeleteDialog } = useDeletePostStore();
  const { handleDeletePost, isDeleting } = useDeletePost({
    id: postId,
    onClose: () => setIsOpen(false),
  });

  const handleStartEditing = () => {
    if (onEditClick) {
      onEditClick();
    } else {
      startEditing(postId, text);
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <div className='icon-container-hover'>
          <MoreVertical className='aspect-square object-cover object-center size-[18px] overflow-hidden flex-1 text-secondary-2' />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        alignOffset={10}
        className='min-w-[190px] p-2 bg-gray-6 border border-border-light rounded-xl'
      >
        {authorId === user?.id ? (
          <Fragment>
            <MenuItem
              icon={Edit}
              disabled={timeLeft <= 0}
              label={
                <div className='flex-between w-full'>
                  <p>Edit</p>
                  {timeLeft > 0 && (
                    <p className='text-[15px] text-gray-3'>
                      {formatTimeLeft(timeLeft)}
                    </p>
                  )}
                </div>
              }
              onClick={handleStartEditing}
            />

            <ConfirmDialog
              open={openDeleteDialog}
              setOpen={setOpenDeleteDialog}
              closeMenu={() => setIsOpen(false)}
              title={`Delete ${isReply ? 'Reply' : 'Comment'}`}
              description={`If you delete this ${
                isReply ? 'reply' : 'comment'
              }, you won't be able to restore it.`}
              onClick={handleDeletePost}
              isLoading={isDeleting}
              trigger={
                <MenuItem
                  icon={Icons.delete}
                  label='Delete'
                  className='text-primary-red'
                />
              }
            />
          </Fragment>
        ) : (
          <Fragment>
            <MenuItem
              icon={Icons.report}
              label='Report'
              className={cn(
                'text-primary-red',
                postAuthorId === user?.id && 'text-white/90',
              )}
              onClick={() => {
                openPostReport(postId);
              }}
              iconColor={postAuthorId === user?.id ? 'white' : '#ff3040'}
            />
            {postAuthorId === user?.id && (
              <ConfirmDialog
                open={openDeleteDialog}
                setOpen={setOpenDeleteDialog}
                closeMenu={() => setIsOpen(false)}
                title={`Delete ${isReply ? 'Reply' : 'Comment'}`}
                description={`If you delete this ${
                  isReply ? 'reply' : 'comment'
                }, you won't be able to restore it.`}
                onClick={handleDeletePost}
                isLoading={isDeleting}
                trigger={
                  <MenuItem
                    icon={Icons.delete}
                    label='Delete'
                    className='text-primary-red'
                  />
                }
              />
            )}
          </Fragment>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CommentActions;
