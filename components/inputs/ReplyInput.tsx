'use client';

import useAddReply from '@/hooks/useAddReply';
import useEditComment from '@/hooks/useEditComment';
import { ReplyInputProps } from '@/lib/types';
import useAddCommentStore from '@/store/addComment';
import { useEffect } from 'react';
import CommentInput from './CommentInput';

const ReplyInput = ({
  postId,
  threadId,
  commentId,
  onCancel,
}: ReplyInputProps) => {
  const {
    replyText,
    setReplyText,
    replyCharCount,
    setReplyCharCount,
    isReplyEdit,
    editReplyId,
    replyToUsername,
  } = useAddCommentStore();

  const {
    handlePostReply,
    handleThreadReply,
    isReplyingPost,
    isReplyingThread,
  } = useAddReply({
    postId,
    threadId,
    commentId,
  });

  const {
    handleEditPostComment,
    handleEditThreadComment,
    isEditing,
    isEditingThread,
  } = useEditComment();

  useEffect(() => {
    if (!isReplyEdit) {
      setReplyCharCount(replyText.length);
    } else {
      setReplyCharCount(replyText.length);
    }
  }, [replyText, isReplyEdit, setReplyCharCount]);

  const submitPostContent = () => {
    if (isReplyEdit) {
      if (!replyText.trim() || isEditing) return;
      handleEditPostComment(editReplyId, replyText);
    } else {
      if (!replyText.trim() || isReplyingPost) return;
      handlePostReply(replyText);
    }
  };

  const submitThreadContent = () => {
    if (isReplyEdit) {
      if (!replyText.trim() || isEditingThread) return;
      handleEditThreadComment(editReplyId, replyText);
    } else {
      if (!replyText.trim() || isReplyingThread) return;
      handleThreadReply(replyText);
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
        onSubmit={threadId ? submitThreadContent : submitPostContent}
        charCount={replyCharCount}
        maxChars={200}
        isSubmitting={
          threadId
            ? isReplyingThread || isEditingThread
            : isReplyingPost || isEditing
        }
        showCancelButton={true}
        onCancel={onCancel}
        isEdit={isReplyEdit}
        replyToUsername={replyToUsername}
        isReply
      />
    </div>
  );
};

export default ReplyInput;
