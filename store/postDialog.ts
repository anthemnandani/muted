import type {
  ParentPostInfo,
  PostData,
  PostType,
  ValidMention,
} from '@/lib/types';
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
  validMentions: ValidMention[];
  addValidMention: (mention: ValidMention) => void;
  updateMentionIndices: (text: string) => void;
  resetPostState: () => void;
}

const usePostDialog = create<ToggleState>((set, get) => ({
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
        linkPreview: post.linkPreview ?? null,
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
  validMentions: [],
  addValidMention: (mention) =>
    set((state) => ({
      validMentions: [...state.validMentions, mention],
    })),

  updateMentionIndices: (text) => {
    const currentMentions = get().validMentions;
    const updatedMentions: ValidMention[] = [];

    currentMentions.forEach((mention) => {
      const mentionText = `@${mention.username}`;
      const index = text.indexOf(mentionText);

      if (index !== -1) {
        const beforeChar = index > 0 ? text[index - 1] : ' ';
        const afterChar =
          index + mentionText.length < text.length
            ? text[index + mentionText.length]
            : ' ';

        const isValidBoundary =
          /\s|^/.test(beforeChar) && /\s|$/.test(afterChar);

        if (isValidBoundary) {
          updatedMentions.push({
            ...mention,
            startIndex: index,
            endIndex: index + mentionText.length,
          });
        }
      }
    });

    set({ validMentions: updatedMentions });
  },

  resetPostState: () =>
    set({
      quoteInfo: null,
      currentMediaIndex: 0,
      showGallery: false,
      showRatioSelector: false,
      editPostId: null,
      postType: 'media',
      step: 'compose',
      validMentions: [],
      postData: {
        privacy: PostPrivacy.ANYONE,
        caption: '',
        threadText: '',
        linkPreview: null,
        hideLikes: false,
        turnOffComments: false,
      },
    }),
}));

export default usePostDialog;
