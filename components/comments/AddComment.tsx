'use client';

import useAddComment from '@/hooks/useAddComment';
import useEditComment from '@/hooks/useEditComment';
import useMentions from '@/hooks/useMentions';
import { cn } from '@/lib/utils';
import useAddCommentStore from '@/store/addComment';
import { useUser } from '@clerk/nextjs';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import UsersMenu from '../menus/UsersMenu';
import { EmojiPicker } from '../modals/EmojiPicker';
import { Avatar, AvatarImage } from '../ui/avatar';

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
  const MAX_CHARS = 200;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    commentText,
    setCommentText,
    isEdit,
    editCommentId,
    currentPostId,
    reset,
    charCount,
    setCharCount,
    setCurrentPostId,
  } = useAddCommentStore();

  const {
    mentionSuggestions,
    showMentionSuggestions,
    cursorPosition,
    handleMentionSearch,
    isMentionsLoading,
    insertMention,
  } = useMentions({
    textareaRef,
    setCommentText,
  });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = textareaRef.current.scrollHeight;
      const baseHeight = 24;

      const lineCount = Math.ceil(newHeight / baseHeight);
      const hasMultipleLines = lineCount > 1;

      if (hasMultipleLines) {
        textareaRef.current.style.height = `${Math.min(newHeight, 170)}px`;
      } else {
        textareaRef.current.style.height = '24px';
      }
    }
  }, [commentText]);

  useEffect(() => {
    if (currentPostId !== postId) {
      setCurrentPostId(postId);
    }
    setCharCount(commentText.length);
  }, [commentText, postId, currentPostId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    handleMentionSearch(text, e.target.selectionStart || 0);
    if (text.length <= MAX_CHARS) {
      setCommentText(text);
      setCharCount(text.length);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const newText = commentText + pastedText;
    const trimmedText = newText.slice(0, MAX_CHARS);

    setCommentText(trimmedText);
    setCharCount(trimmedText.length);
  };

  const handleEmojiSelect = (emoji: string) => {
    const newText = commentText + emoji;
    if (newText.length <= MAX_CHARS) {
      setCommentText(newText);
      setCharCount(newText.length);
    }
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

  const cancelEdit = () => {
    reset();
    setCharCount(0);
  };

  const isAtLimit = charCount >= MAX_CHARS;

  return (
    <div className='border-t border-gray-800 bg-[#101010D9] py-2 px-4'>
      {isEdit && (
        <div className='flex items-center justify-between mb-2'>
          <div className='text-sm text-gray-300'>Editing comment</div>
          <button
            onClick={cancelEdit}
            className='text-gray-400 hover:text-gray-200 flex items-center gap-1 text-sm'
          >
            <X className='size-4' />
            Cancel
          </button>
        </div>
      )}

      <div className='flex items-center gap-2'>
        <Avatar className='size-8 flex-shrink-0'>
          <AvatarImage
            src={user?.imageUrl ?? ''}
            alt={user?.username ?? ''}
            className='object-cover'
          />
        </Avatar>

        <div className='relative flex-1'>
          <div className='flex items-center bg-white-13 rounded-lg px-3 pr-16'>
            <textarea
              ref={textareaRef}
              placeholder={isEdit ? 'Edit comment...' : 'Add comment...'}
              value={commentText}
              onChange={handleInputChange}
              onPaste={handlePaste}
              rows={1}
              autoFocus
              maxLength={MAX_CHARS}
              className={cn(
                'w-full text-sm resize-none bg-transparent text-white placeholder-gray-400 outline-none py-2 overflow-hidden',
                charCount > 0 ? 'pb-7' : ''
              )}
            />

            <div className='absolute bottom-2 right-3 flex items-center gap-2'>
              <EmojiPicker onChange={handleEmojiSelect} />
            </div>
          </div>

          {charCount > 0 && (
            <div
              className={cn(
                `text-xs absolute bottom-2 left-3`,
                isAtLimit ? 'text-primary-blue' : 'text-gray-400'
              )}
            >
              {charCount}/{MAX_CHARS}
            </div>
          )}

          {showMentionSuggestions && (
            <UsersMenu
              showMentionSuggestions={showMentionSuggestions}
              mentionSuggestions={mentionSuggestions}
              cursorPosition={cursorPosition}
              isLoading={isMentionsLoading}
              onSelect={insertMention}
            />
          )}
        </div>

        <button
          onClick={submitComment}
          disabled={isReplying || isEditing || !commentText.trim()}
          className={`font-medium px-2 ${
            !commentText.trim() ? 'text-gray-600' : 'text-primary-blue'
          }`}
        >
          {isEdit ? 'Update' : 'Post'}
        </button>
      </div>
    </div>
  );
};

export default AddComment;
