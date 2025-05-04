import { useReportStore } from '@/store/reportStore';
import { api } from '@/trpc/react';
import { useState } from 'react';
import { toast } from 'sonner';

interface UseReportProps {
  getCurrentCategoryLabel: () => string;
  setShowConfirmation: (value: boolean) => void;
}

const useReport = ({
  getCurrentCategoryLabel,
  setShowConfirmation,
}: UseReportProps) => {
  const [loading, setLoading] = useState(false);
  const {
    setOpen,
    categoryId,
    subcategoryId,
    detailId,
    reason,
    currentPostId,
    currentUserId,
    additionalInfo,
    targetUserId,
  } = useReportStore();

  const { mutate: createReport } = api.report.createReport.useMutation({
    onSuccess: () => {
      setLoading(false);
      setOpen(false);
      setTimeout(() => {
        setShowConfirmation(true);
      }, 200);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit report');
      setLoading(false);
    },
  });

  const handleSubmitReport = () => {
    setLoading(true);
    createReport({
      postId: currentPostId || undefined,
      userId: currentUserId || undefined,
      categoryId: categoryId!,
      subCategoryId: subcategoryId || undefined,
      detailId: detailId || undefined,
      reason: reason || getCurrentCategoryLabel(),
      additionalInfo: additionalInfo || undefined,
      targetUserId: targetUserId || undefined,
    });
  };

  return { handleSubmitReport, loading };
};

export default useReport;
