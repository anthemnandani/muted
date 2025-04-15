'use client';

import useAddComment from '@/hooks/useAddComment';
import useEditComment from '@/hooks/useEditComment';
import useAddCommentStore from '@/store/addComment';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import CommentInput from '../inputs/CommentInput';

interface AddCommentProps {
  postId: string;
  authorId: string;
}

const AddComment = ({ postId, authorId }: AddCommentProps) => {
  const { handleReply, isReplying } = useAddComment({
    postId,
    authorId,
  });

  const { handleEdit, isEditing } = useEditComment();

  const {
    commentText,
    setCommentText,
    isEdit,
    editCommentId,
    currentPostId,
    setCurrentPostId,
    charCount,
    setCharCount,
    reset,
  } = useAddCommentStore();

  useEffect(() => {
    if (currentPostId !== postId) {
      setCurrentPostId(postId);
    }
    setCharCount(commentText.length);
  }, [commentText, postId, currentPostId, setCharCount, setCurrentPostId]);

  const submitComment = async () => {
    if (!commentText.trim()) return;

    if (isEdit && editCommentId && !isEditing) {
      handleEdit();
    } else if (!isReplying) {
      handleReply();
    }
    reset();
  };

  const cancelEdit = () => {
    reset();
  };

  return (
    <div className='border-t border-border-light bg-[#101010D9] py-2 px-4'>
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
        placeholder={isEdit ? 'Edit comment...' : 'Add comment...'}
        textValue={commentText}
        onTextChange={setCommentText}
        onSubmit={submitComment}
        charCount={charCount}
        maxChars={200}
        isSubmitting={isReplying || isEditing}
        isEdit={isEdit}
      />
    </div>
  );
};

export default AddComment;
