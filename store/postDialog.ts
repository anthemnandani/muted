import type { ParentPostInfo, PostData } from '@/lib/types';
import { PostPrivacy } from '@prisma/client';
import { create } from 'zustand';

interface ToggleState {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  postData: PostData;
  setPostData: (post: PostData) => void;
  quoteInfo: ParentPostInfo | null;
  setQuoteInfo: (quote: ParentPostInfo | null) => void;
  editPostInfo: { id: string; text: string } | null;
  setEditPostInfo: (edit: { id: string; text: string } | null) => void;
  step: 'upload' | 'preview' | 'post';
  setStep: (step: 'upload' | 'preview' | 'post') => void;
  currentMediaIndex: number;
  setCurrentMediaIndex: (index: number) => void;
  showGallery: boolean;
  setShowGallery: (show: boolean) => void;
  showRatioSelector: boolean;
  setShowRatioSelector: (show: boolean) => void;
  resetPostState: () => void;
}

const usePostDialog = create<ToggleState>((set) => ({
  openDialog: false,
  setOpenDialog: (open) => set({ openDialog: open }),
  postData: {
    privacy: PostPrivacy.ANYONE,
    text: '',
    linkPreview: null,
    hideLikes: false,
    turnOffComments: false,
  },
  setPostData: (post) => set({ postData: post }),
  quoteInfo: null,
  setQuoteInfo: (quote) => set({ quoteInfo: quote }),
  editPostInfo: null,
  setEditPostInfo: (edit) => set({ editPostInfo: edit }),
  step: 'upload',
  setStep: (step) => set({ step }),
  currentMediaIndex: 0,
  setCurrentMediaIndex: (index) => set({ currentMediaIndex: index }),
  showGallery: false,
  setShowGallery: (show) => set({ showGallery: show }),
  showRatioSelector: false,
  setShowRatioSelector: (show) => set({ showRatioSelector: show }),
  resetPostState: () =>
    set({
      quoteInfo: null,
      editPostInfo: null,
      currentMediaIndex: 0,
      showGallery: false,
      showRatioSelector: false,
      step: 'upload',
      postData: {
        privacy: PostPrivacy.ANYONE,
        text: '',
        linkPreview: null,
        hideLikes: false,
        turnOffComments: false,
      },
    }),
}));

export default usePostDialog;
