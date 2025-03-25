import useAddComment from '@/hooks/useAddComment';
import { getFullName } from '@/lib/utils';
import useAddCommentStore from '@/store/addComment';
import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';

const AddComment = ({
  postId,
  authorId,
}: {
  postId: string;
  authorId: string;
}) => {
  const { handleReply, isReplying } = useAddComment({
    postId,
    authorId,
  });
  const { user } = useUser();
  const {
    commentText,
    setCommentText,
    isCommentBoxOpen,
    setCommentBoxOpen,
    setActivePostId,
  } = useAddCommentStore();

  useEffect(() => {
    setActivePostId(postId);
  }, [postId, setActivePostId]);

  const handleCancelComment = () => {
    setCommentText('');
    setCommentBoxOpen(false);
  };

  const submitComment = () => {
    handleReply();
    if (!isReplying) {
      setCommentText('');
    }
  };

  return (
    <div className='p-4 pt-3 border-t border-border-light'>
      {isCommentBoxOpen ? (
        <div className='flex flex-col'>
          <div className='flex items-center mb-2'>
            <span className='text-white text-sm'>Commenting as</span>
          </div>
          <div className='flex items-center gap-2'>
            <Avatar className='size-8'>
              <AvatarImage
                src={user?.imageUrl ?? ''}
                alt={user?.username ?? ''}
                className='object-cover'
              />
              <AvatarFallback>
                {user?.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className='text-white text-sm'>
              {getFullName(user?.firstName!, user?.lastName ?? '')}
            </span>
          </div>
          <textarea
            className='w-full h-16 bg-transparent border-b border-gray-600 outline-none mt-3 text-white resize-none'
            placeholder='Add a comment...'
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            autoFocus
          />

          <div className='mt-3 flex items-center justify-end w-full gap-2'>
            <Button
              variant='outline'
              className='px-4 py-2 text-gray-400 text-sm bg-transparent border-none hover:bg-transparent hover:text-gray-400'
              onClick={handleCancelComment}
            >
              Cancel
            </Button>
            <Button
              variant='default'
              className='px-4 py-2 bg-gray-100 text-gray-900 rounded-full text-sm hover:bg-gray-100/90 transition-colors'
              disabled={!commentText.trim() || isReplying}
              onClick={submitComment}
            >
              {isReplying ? 'Posting...' : 'Comment'}
            </Button>
          </div>
        </div>
      ) : (
        <div
          className='flex items-center gap-3 cursor-text'
          onClick={() => setCommentBoxOpen(true)}
        >
          <Avatar className='size-8'>
            <AvatarImage
              src={user?.imageUrl ?? ''}
              alt={user?.username ?? ''}
              className='object-cover'
            />
            <AvatarFallback>
              {user?.username?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 bg-[#202327] rounded-full px-4 py-2 text-gray-400 text-sm'>
            Add a comment...
          </div>
        </div>
      )}
    </div>
  );
};

export default AddComment;
