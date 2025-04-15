'use client';

import useAddCommentStore from '@/store/addComment';
import useAddReply from '@/hooks/useAddReply';
import useEditComment from '@/hooks/useEditComment';
import { useEffect } from 'react';
import CommentInput from './CommentInput';
import { ReplyInputProps } from '@/lib/types';

const ReplyInput = ({ postId, commentId, onCancel }: ReplyInputProps) => {
  const {
    replyText,
    setReplyText,
    replyCharCount,
    setReplyCharCount,
    isReplyEdit,
    editReplyId,
    resetReply,
  } = useAddCommentStore();

  const { handleAddReply, isReplying } = useAddReply({
    postId,
    commentId,
  });

  const { handleEdit, isEditing: isEditingInProgress } = useEditComment();

  useEffect(() => {
    if (!isReplyEdit) {
      setReplyCharCount(replyText.length);
    } else {
      setReplyCharCount(replyText.length);
    }
  }, [replyText, isReplyEdit, setReplyCharCount]);

  const submitContent = async () => {
    if (isReplyEdit) {
      if (!replyText.trim() || isEditingInProgress) return;
      handleEdit(editReplyId, replyText);
    } else {
      if (!replyText.trim() || isReplying) return;
      handleAddReply(replyText);
    }
    resetReply();
  };

  return (
    <div className='py-2'>
      <CommentInput
        placeholder={isReplyEdit ? 'Edit reply...' : 'Add a reply...'}
        textValue={replyText}
        onTextChange={setReplyText}
        onSubmit={submitContent}
        charCount={replyCharCount}
        maxChars={200}
        isSubmitting={isReplyEdit ? isEditingInProgress : isReplying}
        showCancelButton={true}
        onCancel={onCancel}
        isEdit={isReplyEdit}
      />
    </div>
  );
};

export default ReplyInput;
