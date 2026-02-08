'use client';

import useAddComment from '@/hooks/useAddComment';
import useEditComment from '@/hooks/useEditComment';
import useAddCommentStore from '@/store/addComment';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import CommentInput from '../inputs/CommentInput';

interface AddThreadCommentProps {
  threadId: string;
  authorId: string;
}

const AddThreadComment = ({ threadId, authorId }: AddThreadCommentProps) => {
  const { handleThreadComment, isCommentingThread } = useAddComment({
    threadId,
    authorId,
  });

  const { handleEditThreadComment, isEditingThread } = useEditComment();

  const {
    commentText,
    setCommentText,
    isEdit,
    editCommentId,
    charCount,
    setCharCount,
    reset,
  } = useAddCommentStore();

  useEffect(() => {
    setCharCount(commentText.length);
  }, [commentText, setCharCount]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const submitComment = async () => {
    if (!commentText.trim()) return;

    if (isEdit && editCommentId && !isEditingThread) {
      await handleEditThreadComment();
    } else if (!isCommentingThread) {
      await handleThreadComment();
    }
  };

  const cancelEdit = () => {
    reset();
  };

  return (
    <div className='pt-3 pb-4 px-4 w-full'>
      {isEdit && (
        <div className='flex justify-end mb-2'>
          <button
            onClick={cancelEdit}
            className='text-gray-400 hover:text-gray-200 flex items-center gap-1 text-sm'
          >
            <X className='size-4' />
            Cancel
          </button>
        </div>
      )}

      <CommentInput
        placeholder={isEdit ? 'Edit comment...' : 'Post your comment...'}
        textValue={commentText}
        onTextChange={setCommentText}
        onSubmit={submitComment}
        charCount={charCount}
        maxChars={200}
        isSubmitting={isCommentingThread || isEditingThread}
        isEdit={isEdit}
      />
    </div>
  );
};

export default AddThreadComment;
