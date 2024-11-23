import { api } from '@/trpc/react';
import { PostPrivacy } from '@prisma/client';
import { debounce } from 'lodash';
import React from 'react';

interface MentionPosition {
  top: number;
  left: number;
}

interface UseMentionsProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  setThreadData: React.Dispatch<
    React.SetStateAction<{
      privacy: PostPrivacy;
      text: string;
    }>
  >;
  setMentions: React.Dispatch<
    React.SetStateAction<
      Array<{
        userId: string;
        index: number;
      }>
    >
  >;
}

const useMentions = ({
  textareaRef,
  setThreadData,
  setMentions,
}: UseMentionsProps) => {
  const [mentionSearch, setMentionSearch] = React.useState<string>('');
  const [showMentionSuggestions, setShowMentionSuggestions] =
    React.useState(false);
  const [cursorPosition, setCursorPosition] = React.useState<MentionPosition>({
    top: 0,
    left: 0,
  });

  const { data: mentionSuggestions, isLoading } =
    api.user.getMentionSuggestions.useQuery(
      { searchQuery: mentionSearch },
      {
        enabled: mentionSearch.length > 0 && showMentionSuggestions,
        refetchOnWindowFocus: false,
        keepPreviousData: false,
        cacheTime: 0,
        staleTime: 0,
      }
    );

  const calculateCursorPosition = React.useCallback(() => {
    const textarea = textareaRef?.current;
    if (!textarea) return;

    const textareaRect = textarea.getBoundingClientRect();
    const cursorPosition = textarea.selectionStart || 0;
    const textContent = textarea.value;
    const textBeforeCursor = textContent.substring(0, cursorPosition);

    const lastAtSymbolIndex = textBeforeCursor.lastIndexOf('@');
    const textBeforeAt = textContent.substring(0, lastAtSymbolIndex);

    const isFirstWord = /^\s*@/.test(textContent);

    const div = document.createElement('div');
    div.style.cssText = window.getComputedStyle(textarea).cssText;
    div.style.height = 'auto';
    div.style.width = textarea.offsetWidth + 'px';
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordBreak = 'break-word';

    div.textContent = textBeforeAt;
    document.body.appendChild(div);

    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
    const lines = Math.floor(div.offsetHeight / lineHeight);

    const span = document.createElement('span');
    span.style.whiteSpace = 'pre';
    span.textContent = textBeforeAt;
    div.innerHTML = '';
    div.appendChild(span);

    const atSymbolLeft = span.offsetWidth;

    document.body.removeChild(div);

    setCursorPosition({
      top: textareaRect.top + lines * lineHeight + (isFirstWord ? 20 : 0),
      left: textareaRect.left + atSymbolLeft - 3,
    });
  }, [textareaRef]);

  const handleMentionSearch = React.useCallback(
    debounce((text: string, cursorIndex: number) => {
      const textBeforeCursor = text.slice(0, cursorIndex);
      const matches = textBeforeCursor.match(/@(\w*)$/);

      if (matches && matches[1] !== undefined) {
        const searchTerm = matches[1];
        if (searchTerm.length > 0) {
          setMentionSearch(searchTerm);
          setShowMentionSuggestions(true);
          calculateCursorPosition();
        } else {
          setShowMentionSuggestions(false);
        }
      } else {
        setShowMentionSuggestions(false);
      }
    }, 500),
    [calculateCursorPosition]
  );

  const insertMention = React.useCallback(
    (username: string, userId: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const text = textarea.value;
      const cursorPosition = textarea.selectionStart || 0;
      const textBeforeCursor = text.slice(0, cursorPosition);

      const lastAtIndex = textBeforeCursor.lastIndexOf('@');

      const currentWord = textBeforeCursor.slice(lastAtIndex).match(/@(\w*)/);

      const removeLength = currentWord ? currentWord[0].length : 0;

      const newText =
        text.slice(0, lastAtIndex) +
        `@${username} ` +
        text.slice(lastAtIndex + removeLength);

      setThreadData((prev) => ({ ...prev, text: newText }));

      setShowMentionSuggestions(false);
      setMentionSearch('');

      setMentions((prev) => [
        ...prev,
        {
          userId,
          index: lastAtIndex,
        },
      ]);

      const newCursorPosition = lastAtIndex + username.length + 2;

      requestAnimationFrame(() => {
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        textarea.focus();
      });
    },
    [textareaRef, setThreadData]
  );

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.mentions-menu') && target !== textareaRef.current) {
        setShowMentionSuggestions(false);
        setMentionSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [textareaRef]);

  React.useEffect(() => {
    if (mentionSearch === '') {
      setShowMentionSuggestions(false);
    }
  }, [mentionSearch]);

  React.useEffect(() => {
    return () => {
      handleMentionSearch.cancel();
    };
  }, [handleMentionSearch]);

  return {
    mentionSuggestions,
    showMentionSuggestions,
    cursorPosition,
    handleMentionSearch,
    isLoading,
    insertMention,
  };
};

export default useMentions;
