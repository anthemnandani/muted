'use client';

import { useOptimisticAction } from '@/contexts/OptimisticActionContext';
import { api } from '@/trpc/react';
import { useRef } from 'react';
import { toast } from 'sonner';

const usePinThread = ({ id, pinned }: { id: string; pinned: boolean }) => {
  const performAction = useOptimisticAction();
  //   const utils = api.useUtils();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isDirtyRef = useRef(false);

  const { mutate: togglePinMutation } = api.thread.togglePinThread.useMutation({
    onError: (err) => {
      if (performAction) {
        performAction(id, 'PIN', pinned);
      }
      toast.error('Failed to update pin status');
      isDirtyRef.current = false;
    },

    onSettled: () => {
      isDirtyRef.current = false;

      //   utils.thread.getAllThreads.invalidate();
      //   utils.user.getUserPosts.invalidate();
    },
  });

  const togglePin = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (performAction) {
      performAction(id, 'PIN', !pinned);
      toast.success(pinned ? 'Unpinned' : 'Pinned');
    }

    isDirtyRef.current = !isDirtyRef.current;

    timeoutRef.current = setTimeout(() => {
      if (isDirtyRef.current) {
        togglePinMutation({ threadId: id });
      }
    }, 1000);
  };

  return {
    togglePin,
  };
};

export default usePinThread;
