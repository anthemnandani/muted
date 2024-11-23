import { cn } from '@/lib/utils';
import * as React from 'react';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  forwardedRef?: React.RefObject<HTMLTextAreaElement>;
}

const ResizeTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, forwardedRef, ...props }, _) => {
    function updateTextAreaSize(textArea?: HTMLTextAreaElement) {
      if (textArea == null) return;
      textArea.style.height = '0';
      textArea.style.height = `${textArea.scrollHeight}px`;
    }

    const textAreaRef = React.useRef<HTMLTextAreaElement>();
    const inputRef = React.useCallback(
      (textArea: HTMLTextAreaElement) => {
        updateTextAreaSize(textArea);
        textAreaRef.current = textArea;
        if (forwardedRef) {
          (forwardedRef as { current: HTMLTextAreaElement | null }).current =
            textArea;
        }
      },
      [forwardedRef]
    );

    React.useLayoutEffect(() => {
      updateTextAreaSize(textAreaRef.current);
    }, [props.value]);

    return (
      <textarea
        style={{ height: 0 }}
        className={cn(
          'flex-grow resize-none overflow-hidden outline-none text-[15px] text-accent-foreground break-words placeholder:text-gray-3 w-full bg-transparent tracking-normal',
          className
        )}
        ref={inputRef}
        {...props}
      />
    );
  }
);

ResizeTextarea.displayName = 'ResizeTextarea';

export { ResizeTextarea };
