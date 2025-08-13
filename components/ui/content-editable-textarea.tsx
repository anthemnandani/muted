// src/components/ui/content-editable-textarea.tsx

import { ValidMention } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  ClipboardEvent,
  forwardRef,
  HTMLAttributes,
  useCallback,
  useLayoutEffect,
  useRef,
} from 'react';
import ContentEditable, {
  type ContentEditableEvent,
} from 'react-contenteditable';

// Define the new props interface
export interface ContentEditableTextareaProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: string;
  onChange: (event: ContentEditableEvent) => void;
  forwardedRef?: React.RefObject<HTMLElement>;
  placeholder?: string;
  validMentions?: ValidMention[];
}

const ContentEditableTextarea = forwardRef<
  HTMLElement,
  ContentEditableTextareaProps
>(
  (
    {
      className,
      value,
      onChange,
      forwardedRef,
      placeholder,
      validMentions,
      ...props
    },
    _
  ) => {
    // The ref for the contenteditable element itself
    const internalRef = useRef<HTMLElement>(null);

    // This function can now work on any HTMLElement that has scrollHeight
    const updateElementSize = (element?: HTMLElement | null) => {
      if (!element) return;
      element.style.height = 'auto'; // Use 'auto' instead of '0' for better consistency
      element.style.height = `${element.scrollHeight}px`;
    };

    // This ref callback connects the forwardedRef and internalRef
    const refCallback = useCallback(
      (element: HTMLElement) => {
        (internalRef as React.MutableRefObject<HTMLElement | null>).current =
          element;
        if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLElement | null>).current =
            element;
        }
        updateElementSize(element);
      },
      [forwardedRef]
    );

    // Update size when the value changes
    useLayoutEffect(() => {
      updateElementSize(internalRef.current);
    }, [value]);

    // Handle autoFocus
    useLayoutEffect(() => {
      if (props.autoFocus && internalRef.current) {
        const el = internalRef.current;
        el.focus();
        // Move cursor to the end for a better UX
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(el);
        range.collapse(false); // `false` collapses the range to the end
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }, [props.autoFocus]);

    const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
      event.preventDefault();
      const text = event.clipboardData.getData('text/plain');
      // Use the modern Input Events API if available, otherwise fall back to execCommand
      if (window.InputEvent) {
        (event.target as HTMLElement).blur();
        (event.target as HTMLElement).focus();
        document.execCommand('insertText', false, text);
      } else {
        // Fallback for older browsers
        const range = document.getSelection()?.getRangeAt(0);
        if (!range) return;
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
      }
    };

    return (
      <ContentEditable
        // The innerRef prop is provided by react-contenteditable to get the DOM element
        innerRef={refCallback}
        html={value} // Use the 'html' prop for content
        onChange={onChange}
        onPaste={handlePaste}
        tagName='div' // Render as a div
        className={cn(
          'flex-grow resize-none overflow-hidden outline-none text-[15px] text-accent-foreground break-words w-full bg-transparent tracking-normal',
          'focus:relative focus:z-[1] focus-visible:outline-none focus-visible:ring-transparent',
          'max-h-[175px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent pr-4',
          // Placeholder styling
          'empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-500 empty:before:cursor-text',
          className
        )}
        // Pass placeholder via data-attribute for CSS pseudo-element
        data-placeholder={placeholder}
        {...props}
      />
    );
  }
);

ContentEditableTextarea.displayName = 'ContentEditableTextarea';

export { ContentEditableTextarea };
