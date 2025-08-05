import { cn } from '@/lib/utils';
import {
  forwardRef,
  RefObject,
  TextareaHTMLAttributes,
  useCallback,
  useLayoutEffect,
  useRef,
  useEffect,
} from 'react';

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  forwardedRef?: RefObject<HTMLTextAreaElement>;
}

const ResizeTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, forwardedRef, ...props }, _) => {
    function updateTextAreaSize(textArea?: HTMLTextAreaElement) {
      if (textArea == null) return;
      textArea.style.height = '0';
      textArea.style.height = `${textArea.scrollHeight}px`;
    }

    const textAreaRef = useRef<HTMLTextAreaElement>();
    const inputRef = useCallback(
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

    useLayoutEffect(() => {
      updateTextAreaSize(textAreaRef.current);
    }, [props.value]);

    useEffect(() => {
      if (props.autoFocus && textAreaRef.current) {
        textAreaRef.current.focus();
      }
    }, [props.autoFocus]);

    return (
      <textarea
        style={{ height: 0 }}
        className={cn(
          'flex-grow resize-none overflow-hidden outline-none text-[15px] text-accent-foreground break-words placeholder:text-gray-3 w-full bg-transparent tracking-normal',
          'focus:relative focus:z-[1] focus-visible:outline-none focus-visible:ring-transparent',
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
