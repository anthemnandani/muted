'use client';

import { ThreadReplyCardProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import useAddCommentStore from '@/store/addComment';
import ReplyInput from '../inputs/ReplyInput';
import ThreadCommentContent from '../shared/ThreadCommentContent';

const ThreadReplyCard = ({
  reply,
  isLast,
  originalThreadId,
  threadAuthorId,
}: ThreadReplyCardProps) => {
  const { id, author, text } = reply;

  const {
    isReply,
    activeReplyCommentId,
    startReplyEditing,
    isReplyEdit,
    editReplyId,
    cancelReply,
    resetReply,
    replyToUsername,
  } = useAddCommentStore();

  const handleCancelReply = () => {
    cancelReply();
  };

  const handleCancelEdit = () => {
    resetReply();
  };

  const handleEditClick = () => {
    startReplyEditing(id, text || '');
  };

  const isActiveReplyInput =
    isReply &&
    activeReplyCommentId === id &&
    replyToUsername === author.username;

  const isActiveEditInput = isReplyEdit && editReplyId === id;

  return (
    <div className={cn('py-2', { 'mb-1': isLast })}>
      <ThreadCommentContent
        comment={reply}
        threadAuthorId={threadAuthorId}
        onEditClick={handleEditClick}
        isReply
      />

      {isActiveReplyInput && (
        <div className='mt-2 ml-10'>
          <ReplyInput
            threadId={originalThreadId}
            commentId={originalThreadId}
            onCancel={handleCancelReply}
          />
        </div>
      )}

      {isActiveEditInput && (
        <div className='mt-2 ml-10'>
          <ReplyInput
            threadId={originalThreadId}
            commentId={id}
            onCancel={handleCancelEdit}
          />
        </div>
      )}
    </div>
  );
};

export default ThreadReplyCard;
