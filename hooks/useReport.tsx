import { useReportStore } from '@/store/reportStore';
import { api } from '@/trpc/react';
import { useRef } from 'react';
import { toast } from 'sonner';

interface UseReportProps {
  getCurrentCategoryLabel: () => string;
  setShowConfirmation: (value: boolean) => void;
}

const useReport = ({
  getCurrentCategoryLabel,
  setShowConfirmation,
}: UseReportProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDirtyRef = useRef(false);
  const {
    setOpen,
    categoryId,
    subcategoryId,
    detailId,
    reason,
    currentPostId,
    currentThreadId,
    currentUserId,
    additionalInfo,
    targetUserId,
  } = useReportStore();

  const { mutate: createReport } = api.report.createReport.useMutation({
    onError: (err) => {
      toast.error(`Failed to report ${currentThreadId ? 'thread' : 'post'}`);
      isDirtyRef.current = false;
    },
    onSettled: () => {
      isDirtyRef.current = false;
    },
  });

  const handleSubmitReport = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    isDirtyRef.current = !isDirtyRef.current;

    setOpen(false);
    setTimeout(() => {
      setShowConfirmation(true);
    }, 300);

    timeoutRef.current = setTimeout(() => {
      if (isDirtyRef.current) {
        createReport({
          postId: currentPostId || undefined,
          userId: currentUserId || undefined,
          threadId: currentThreadId || undefined,
          categoryId: categoryId!,
          subCategoryId: subcategoryId || undefined,
          detailId: detailId || undefined,
          reason: reason || getCurrentCategoryLabel(),
          additionalInfo: additionalInfo || undefined,
          targetUserId: targetUserId || undefined,
        });
      }
    }, 1000);
  };

  return { handleSubmitReport };
};

export default useReport;
