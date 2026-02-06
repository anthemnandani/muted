import type {
  ReplyThreadInfo,
  ThreadInfo,
  LinkPreview,
  ValidMention,
  Mention,
} from '@/lib/types';
import type { PostPrivacy } from '@prisma/client';
import { create } from 'zustand';

interface EditThreadData {
  id: string;
  text: string;
  privacy: PostPrivacy;
  linkPreview: LinkPreview | null;
  mentions?: Mention[];
}

interface ThreadStoreProps {
  openDialog: boolean;
  deleteThreadId: string | null;
  text: string;
  privacy: PostPrivacy;
  linkPreview: LinkPreview | null;
  quoteInfo: ThreadInfo | null;
  validMentions: ValidMention[];
  replyThreadInfo: ReplyThreadInfo | null;
  editThreadInfo: EditThreadData | null;

  setOpenDialog: (open: boolean) => void;
  setDeleteThreadId: (id: string | null) => void;
  setText: (text: string) => void;
  setPrivacy: (privacy: PostPrivacy) => void;
  setLinkPreview: (linkPreview: LinkPreview | null) => void;
  setQuoteInfo: (quote: ThreadInfo | null) => void;
  addValidMention: (mention: ValidMention) => void;
  setReplyThreadInfo: (reply: ReplyThreadInfo | null) => void;
  setEditThreadInfo: (edit: EditThreadData | null) => void;

  updateMentionIndices: (text: string) => void;

  reset: () => void;
}

export const useThreadStore = create<ThreadStoreProps>((set, get) => ({
  openDialog: false,
  deleteThreadId: null,
  text: '',
  privacy: 'ANYONE',
  linkPreview: null,
  validMentions: [],
  replyThreadInfo: null,
  editThreadInfo: null,
  quoteInfo: null,

  setOpenDialog: (open: boolean) => set({ openDialog: open }),
  setDeleteThreadId: (id: string | null) => set({ deleteThreadId: id }),
  setText: (text: string) => set({ text }),
  setPrivacy: (privacy: PostPrivacy) => set({ privacy }),
  setLinkPreview: (linkPreview: LinkPreview | null) => set({ linkPreview }),
  setQuoteInfo: (quote) => set({ quoteInfo: quote }),
  addValidMention: (mention) =>
    set((state) => ({
      validMentions: [...state.validMentions, mention],
    })),
  setReplyThreadInfo: (reply) => set({ replyThreadInfo: reply }),
  setEditThreadInfo: (edit) => set({ editThreadInfo: edit }),
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
  reset: () => {
    set({ openDialog: false });
    setTimeout(
      () =>
        set({
          text: '',
          privacy: 'ANYONE',
          linkPreview: null,
          validMentions: [],
          replyThreadInfo: null,
          editThreadInfo: null,
          quoteInfo: null,
          deleteThreadId: null,
        }),
      300,
    );
  },
}));
