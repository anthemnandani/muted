import useTimeLeft from '@/hooks/useTimeLeft';
import { CommentActionsProps } from '@/lib/types';
import { cn, formatTimeLeft } from '@/lib/utils';
import useAddCommentStore from '@/store/addComment';
import { useUser } from '@clerk/nextjs';
import { DropdownMenu } from '@radix-ui/react-dropdown-menu';
import { Edit, MoreVertical } from 'lucide-react';
import { Fragment, useState } from 'react';
import { Icons } from '../icons';
import DeletePost from '../modals/DeletePost';
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
}: CommentActionsProps) => {
  const { user } = useUser();
  const { timeLeft } = useTimeLeft({ createdAt });
  const { startEditing } = useAddCommentStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleStartEditing = () => {
    if (onEditClick) {
      onEditClick();
    } else {
      startEditing(postId, text);
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div className='icon-container-hover'>
          <MoreVertical className='aspect-square object-cover object-center size-[18px] overflow-hidden flex-1 text-secondary' />
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
            <DeletePost
              postId={postId}
              isComment
              isReply={isReply}
              closeDropdown={() => setIsOpen(false)}
            />
          </Fragment>
        ) : (
          <Fragment>
            <MenuItem
              icon={Icons.report}
              label='Report'
              className={cn(
                'text-primary-red',
                postAuthorId === user?.id && 'text-white/90'
              )}
              iconColor={postAuthorId === user?.id ? 'white' : '#ff3040'}
            />
            {postAuthorId === user?.id && (
              <DeletePost
                postId={postId}
                isComment
                isReply={isReply}
                closeDropdown={() => setIsOpen(false)}
              />
            )}
          </Fragment>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CommentActions;
