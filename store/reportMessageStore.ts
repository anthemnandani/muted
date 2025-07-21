import type { MessageReportCategoryType } from '@/lib/types';
import { create } from 'zustand';

type ReportType = {
  category: MessageReportCategoryType;
  reason: string;
};

interface ReportMessageStore {
  openReportMessageId: string | null;
  setOpenReportMessageId: (messageId: string | null) => void;
  isReportOpen: (messageId: string) => boolean;
  closeReport: () => void;
  reportData: ReportType | null;
  setReportData: (data: ReportType | null) => void;
  reset: () => void;
}

const useReportMessageStore = create<ReportMessageStore>((set, get) => ({
  openReportMessageId: null,

  setOpenReportMessageId: (messageId) =>
    set({ openReportMessageId: messageId }),

  isReportOpen: (messageId) => get().openReportMessageId === messageId,

  closeReport: () => set({ openReportMessageId: null }),

  reportData: null,
  setReportData: (data) => set({ reportData: data }),

  reset: () => set({ openReportMessageId: null, reportData: null }),
}));

export default useReportMessageStore;
