import useDeletePost from '@/hooks/useDeletePost';
import useDeleteThread from '@/hooks/useDeleteThread';
import useTimeLeft from '@/hooks/useTimeLeft';
import { CommentActionsProps } from '@/lib/types';
import { cn, formatTimeLeft } from '@/lib/utils';
import useAddCommentStore from '@/store/addComment';
import { useReportStore } from '@/store/reportStore';
import { useUser } from '@clerk/nextjs';
import { DropdownMenu } from '@radix-ui/react-dropdown-menu';
import { Edit, MoreVertical } from 'lucide-react';
import { Fragment, useState } from 'react';
import { Icons } from '../icons';
import ConfirmDialog from '../modals/ConfirmDialog';
import MenuItem from '../shared/MenuItem';
import { DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu';

const CommentActions = ({
  authorId,
  postAuthorId,
  postId,
  createdAt,
  text,
  isReply,
  onEditClick,
  type = 'POST',
}: CommentActionsProps) => {
  const { user } = useUser();
  const { timeLeft } = useTimeLeft({ createdAt });
  const { startEditing } = useAddCommentStore();
  const { openPostReport } = useReportStore();
  const [isOpen, setIsOpen] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const { handleDeletePost } = useDeletePost({
    id: postId,
    onClose: () => {
      setIsOpen(false);
      setOpenDeleteDialog(false);
    },
  });

  const { handleDeleteThread } = useDeleteThread({
    id: postId,
    onClose: () => {
      setIsOpen(false);
      setOpenDeleteDialog(false);
    },
  });

  const handleDelete =
    type === 'THREAD' ? handleDeleteThread : handleDeletePost;

  const handleStartEditing = () => {
    if (onEditClick) {
      onEditClick();
    } else {
      startEditing(postId, text);
    }
    setIsOpen(false);
  };

  return (
    <Fragment>
      <ConfirmDialog
        open={openDeleteDialog}
        setOpen={setOpenDeleteDialog}
        closeMenu={() => setIsOpen(false)}
        title={`Delete ${isReply ? 'Reply' : 'Comment'}`}
        description={`If you delete this ${
          isReply ? 'reply' : 'comment'
        }, you won't be able to restore it.`}
        onClick={handleDelete}
      />
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <div className='icon-container-hover'>
            <MoreVertical className='aspect-square object-cover object-center size-[18px] overflow-hidden flex-1 text-secondary-2' />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          alignOffset={10}
          className='min-w-[190px] p-2 bg-gray-6 border border-border-light rounded-xl z-[999]'
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

              <MenuItem
                icon={Icons.delete}
                label='Delete'
                className='text-primary-red focus:text-primary-red'
                onClick={() => {
                  setOpenDeleteDialog(true);
                  setIsOpen(false);
                }}
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
                <MenuItem
                  icon={Icons.delete}
                  label='Delete'
                  className='text-primary-red focus:text-primary-red'
                  onClick={() => {
                    setOpenDeleteDialog(true);
                    setIsOpen(false);
                  }}
                />
              )}
            </Fragment>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </Fragment>
  );
};

export default CommentActions;
