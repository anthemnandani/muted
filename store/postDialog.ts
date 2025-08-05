import type { ParentPostInfo, PostData, PostType } from '@/lib/types';
import { PostPrivacy } from '@prisma/client';
import { create } from 'zustand';

type PostWithId = PostData & {
  id: string;
};

interface ToggleState {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  postData: PostData;
  setPostData: (post: PostData) => void;
  postType: PostType;
  setPostType: (type: PostType) => void;
  editPostId: string | null;
  quoteInfo: ParentPostInfo | null;
  setQuoteInfo: (quote: ParentPostInfo | null) => void;
  openForEditing: (post: PostWithId) => void;
  step: 'compose' | 'preview' | 'post';
  setStep: (step: 'compose' | 'preview' | 'post') => void;
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
    caption: '',
    threadText: '',
    linkPreview: null,
    hideLikes: false,
    turnOffComments: false,
  },
  setPostData: (post) => set({ postData: post }),
  postType: 'media',
  setPostType: (type) => set({ postType: type }),
  editPostId: null,
  quoteInfo: null,
  setQuoteInfo: (quote) => set({ quoteInfo: quote }),
  openForEditing: (post) => {
    const isThread = !!post.threadText;
    set({
      editPostId: post.id,
      openDialog: true,
      postType: isThread ? 'thread' : 'media',
      step: isThread ? 'compose' : 'post',
      postData: {
        caption: post.caption ?? '',
        threadText: post.threadText ?? '',
        hideLikes: post.hideLikes ?? false,
        turnOffComments: post.turnOffComments ?? false,
      },
    });
  },
  step: 'compose',
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
      currentMediaIndex: 0,
      showGallery: false,
      showRatioSelector: false,
      editPostId: null,
      postType: 'media',
      step: 'compose',
      postData: {
        privacy: PostPrivacy.ANYONE,
        caption: '',
        threadText: '',
        hideLikes: false,
        turnOffComments: false,
      },
    }),
}));

export default usePostDialog;
