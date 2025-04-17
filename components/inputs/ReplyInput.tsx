'use client';

import useAddReply from '@/hooks/useAddReply';
import useEditComment from '@/hooks/useEditComment';
import { ReplyInputProps } from '@/lib/types';
import useAddCommentStore from '@/store/addComment';
import { useEffect } from 'react';
import CommentInput from './CommentInput';

const ReplyInput = ({ postId, commentId, onCancel }: ReplyInputProps) => {
  const {
    replyText,
    setReplyText,
    replyCharCount,
    setReplyCharCount,
    isReplyEdit,
    editReplyId,
    replyToUsername,
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
  };

  const placeholder = isReplyEdit
    ? 'Edit reply...'
    : replyToUsername
    ? `Reply to @${replyToUsername}...`
    : 'Add a reply...';

  return (
    <div className='py-2'>
      <CommentInput
        placeholder={placeholder}
        textValue={replyText}
        onTextChange={setReplyText}
        onSubmit={submitContent}
        charCount={replyCharCount}
        maxChars={200}
        isSubmitting={isReplyEdit ? isEditingInProgress : isReplying}
        showCancelButton={true}
        onCancel={onCancel}
        isEdit={isReplyEdit}
        replyToUsername={replyToUsername}
      />
    </div>
  );
};

export default ReplyInput;
