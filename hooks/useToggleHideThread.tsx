import { useHiddenThreads } from '@/store/hiddenThreads';
import { api } from '@/trpc/react';
import { useRef } from 'react';
import { toast } from 'sonner';

const useToggleHideThread = ({ threadId }: { threadId: string }) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDirtyRef = useRef(false);
  const { isThreadHidden, hideThread, unhideThread } = useHiddenThreads();
  const isHidden = isThreadHidden(threadId);

  const { mutate: toggleHideThread } = api.thread.toggleHideThread.useMutation({
    onError: (err) => {
      if (isHidden) {
        unhideThread(threadId);
      } else {
        hideThread(threadId);
      }
      toast.error('Failed to update thread visibility');
      isDirtyRef.current = false;
    },

    onSettled: () => {
      isDirtyRef.current = false;
    },
  });

  const toggleHide = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (isHidden) {
      unhideThread(threadId);
      toast.success('Unhidden');
    } else {
      hideThread(threadId);
      toast.success('Hidden');
    }

    isDirtyRef.current = !isDirtyRef.current;

    timeoutRef.current = setTimeout(() => {
      if (isDirtyRef.current) {
        toggleHideThread({ threadId });
      }
    }, 1000);
  };

  return {
    toggleHide,
  };
};

export default useToggleHideThread;
