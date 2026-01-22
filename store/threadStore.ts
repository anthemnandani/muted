import type { LinkPreview, ReplyPostInfo, ValidMention } from '@/lib/types';
import type { PostPrivacy } from '@prisma/client';
import { create } from 'zustand';

interface ThreadStoreProps {
  openDialog: boolean;
  text: string;
  privacy: PostPrivacy;
  linkPreview: LinkPreview | null;
  validMentions: ValidMention[];
  replyPostInfo: ReplyPostInfo | null;
  editPostInfo: { id: string; text: string } | null;

  setOpenDialog: (open: boolean) => void;
  setText: (text: string) => void;
  setPrivacy: (privacy: PostPrivacy) => void;
  setLinkPreview: (linkPreview: LinkPreview | null) => void;
  addValidMention: (mention: ValidMention) => void;
  setReplyPostInfo: (reply: ReplyPostInfo | null) => void;
  setEditPostInfo: (edit: { id: string; text: string } | null) => void;

  updateMentionIndices: (text: string) => void;

  reset: () => void;
}

export const useThreadStore = create<ThreadStoreProps>((set, get) => ({
  openDialog: false,
  text: '',
  privacy: 'ANYONE',
  linkPreview: null,
  validMentions: [],
  replyPostInfo: null,
  editPostInfo: null,

  setOpenDialog: (open: boolean) => set({ openDialog: open }),
  setText: (text: string) => set({ text }),
  setPrivacy: (privacy: PostPrivacy) => set({ privacy }),
  setLinkPreview: (linkPreview: LinkPreview | null) => set({ linkPreview }),
  addValidMention: (mention) =>
    set((state) => ({
      validMentions: [...state.validMentions, mention],
    })),
  setReplyPostInfo: (reply) => set({ replyPostInfo: reply }),
  setEditPostInfo: (edit) => set({ editPostInfo: edit }),
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
  reset: () =>
    set({
      text: '',
      privacy: 'ANYONE',
      linkPreview: null,
      validMentions: [],
      replyPostInfo: null,
      editPostInfo: null,
    }),
}));
