import useTimeLeft from '@/hooks/useTimeLeft';
import { CommentActionsProps } from '@/lib/types';
import { formatTimeLeft } from '@/lib/utils';
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
  postId,
  createdAt,
  text,
}: CommentActionsProps) => {
  const { user } = useUser();
  const { timeLeft } = useTimeLeft({ createdAt });
  const { startEditing } = useAddCommentStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleStartEditing = () => {
    startEditing(postId, text);
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
              closeDropdown={() => setIsOpen(false)}
            />
          </Fragment>
        ) : (
          <MenuItem
            icon={Icons.report}
            label='Report'
            className='text-primary-red focus:text-primary-red'
            isActionMenuItem
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CommentActions;
