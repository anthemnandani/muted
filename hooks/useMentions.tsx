import { type MentionPosition, UseMentionsProps } from '@/lib/types';
import { api } from '@/trpc/react';
import { debounce } from 'lodash';
import { useState, useCallback, useEffect } from 'react';

const useMentions = ({ textareaRef, setCommentText }: UseMentionsProps) => {
  const [mentionSearch, setMentionSearch] = useState<string>('');
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<MentionPosition>({
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

  const calculateCursorPosition = useCallback(() => {
    const textarea = textareaRef?.current;
    if (!textarea) return;

    const textareaRect = textarea.getBoundingClientRect();
    const cursorPosition = textarea.selectionStart || 0;
    const textContent = textarea.value;
    const textBeforeCursor = textContent.substring(0, cursorPosition);
    const lastAtSymbolIndex = textBeforeCursor.lastIndexOf('@');

    const div = document.createElement('div');
    const computedStyle = window.getComputedStyle(textarea);

    div.style.cssText = computedStyle.cssText;
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.height = 'auto';
    div.style.width = `${textarea.clientWidth}px`;
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordBreak = 'break-word';
    div.style.overflow = 'hidden';
    div.style.top = '0';
    div.style.left = '0';

    div.style.padding = computedStyle.padding;
    div.style.border = computedStyle.border;
    div.style.boxSizing = computedStyle.boxSizing;
    div.style.lineHeight = computedStyle.lineHeight;
    div.style.fontFamily = computedStyle.fontFamily;
    div.style.fontSize = computedStyle.fontSize;
    div.style.fontWeight = computedStyle.fontWeight;

    const beforeSpan = document.createElement('span');
    beforeSpan.textContent = textContent.substring(0, lastAtSymbolIndex);

    const atSymbolSpan = document.createElement('span');
    atSymbolSpan.textContent = '@';

    div.appendChild(beforeSpan);
    div.appendChild(atSymbolSpan);
    document.body.appendChild(div);

    const atSymbolRect = atSymbolSpan.getBoundingClientRect();
    const divRect = div.getBoundingClientRect();
    const scrollTop = textarea.scrollTop;
    const scrollLeft = textarea.scrollLeft;

    const relativeLeft = atSymbolRect.left - divRect.left;
    const relativeTop = atSymbolRect.top - divRect.top;

    document.body.removeChild(div);

    setCursorPosition({
      top: textareaRect.top + relativeTop - scrollTop + window.scrollY + 20,
      left: textareaRect.left + relativeLeft - scrollLeft + window.scrollX,
    });
  }, [textareaRef]);

  const handleMentionSearch = useCallback(
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

  const insertMention = useCallback(
    (username: string) => {
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

      setCommentText(newText);

      setShowMentionSuggestions(false);
      setMentionSearch('');

      const newCursorPosition = lastAtIndex + username.length + 2;

      requestAnimationFrame(() => {
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        textarea.focus();
      });
    },
    [textareaRef, setCommentText]
  );

  useEffect(() => {
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

  useEffect(() => {
    if (mentionSearch === '') {
      setShowMentionSuggestions(false);
    }
  }, [mentionSearch]);

  useEffect(() => {
    return () => {
      handleMentionSearch.cancel();
    };
  }, [handleMentionSearch]);

  return {
    mentionSuggestions,
    showMentionSuggestions,
    cursorPosition,
    handleMentionSearch,
    isMentionsLoading: isLoading,
    insertMention,
  };
};

export default useMentions;
