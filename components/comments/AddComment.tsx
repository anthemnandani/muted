import useAddComment from '@/hooks/useAddComment';
import useEditComment from '@/hooks/useEditComment';
import useAddCommentStore from '@/store/addComment';
import { useUser } from '@clerk/nextjs';
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

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
  const { handleEdit, isEditing } = useEditComment();
  const { user } = useUser();
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 150;
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    commentText,
    setCommentText,
    isEdit,
    editCommentId,
    currentPostId,
    reset,
    setCurrentPostId,
  } = useAddCommentStore();

  useEffect(() => {
    if (currentPostId !== postId) {
      setCurrentPostId(postId);
    }

    setCharCount(commentText.length);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef, commentText, postId, currentPostId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) {
      setCommentText(text);
      setCharCount(text.length);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    const newText = commentText + pastedText;
    const trimmedText = newText.slice(0, MAX_CHARS);

    setCommentText(trimmedText);
    setCharCount(trimmedText.length);
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;

    if (isEdit && editCommentId && !isEditing) {
      handleEdit();
    } else if (!isReplying) {
      handleReply();
    }
    reset();
    setCharCount(0);
  };

  const handleCancel = () => {
    reset();
    setCharCount(0);
  };

  return (
    <div className='fixed bottom-0 left-0 right-0 border-t border-gray-800 bg-black z-50'>
      <div className='flex items-start p-3'>
        <Avatar className='size-8 mr-3 mt-1 flex-shrink-0'>
          <AvatarImage
            src={user?.imageUrl ?? ''}
            alt={user?.username ?? ''}
            className='object-cover'
          />
          <AvatarFallback className='bg-gray-700 text-white'>
            {user?.username?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className='flex-1 relative'>
          <div className='relative bg-white-12 rounded-2xl overflow-hidden'>
            <textarea
              ref={inputRef}
              className='w-full bg-transparent text-white placeholder-gray-500 px-4 py-3 outline-none resize-none min-h-20 hide-scrollbar'
              placeholder={isEdit ? 'Edit comment...' : 'Add comment...'}
              value={commentText}
              onChange={handleInputChange}
              onPaste={handlePaste}
              autoFocus
              rows={1}
              maxLength={MAX_CHARS}
            />
            <span
              className={`text-xs absolute right-4 bottom-3 font-bold ${
                charCount >= MAX_CHARS ? 'text-red-500' : 'text-gray-400'
              }`}
            >
              {charCount}/{MAX_CHARS}
            </span>
          </div>

          {(commentText.trim() || isEdit) && (
            <div className='flex justify-end mt-1 gap-2'>
              {isEdit && (
                <button
                  onClick={handleCancel}
                  className='text-sm font-medium text-gray-400 hover:text-gray-300'
                >
                  Cancel
                </button>
              )}
              <button
                onClick={submitComment}
                disabled={isReplying || isEditing || !commentText.trim()}
                className='text-sm font-bold text-primary-blue hover:text-primary-blue/80 disabled:opacity-50'
              >
                {isEdit ? 'Edit' : 'Post'}
              </button>
            </div>
          )}
        </div>
      </div>

      {!isEdit && (
        <div
          className='w-full h-0.5 bg-gradient-to-r from-blue-400 to-blue-500 opacity-70'
          style={{ background: 'linear-gradient(to right, #18a3fe, #0d8edc)' }}
        ></div>
      )}
    </div>
  );
};

export default AddComment;
